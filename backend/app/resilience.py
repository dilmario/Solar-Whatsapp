"""
resilience.py — Rate limiting, resiliência e proteções do sistema.
"""
from __future__ import annotations

import asyncio
import time
from functools import wraps
from typing import Any, Callable, Optional

from app.config import settings

# Memória simples para rate limiting (em produção, usar Redis)
_rate_limit_cache: dict[str, list[float]] = {}


def rate_limit(key: str, max_requests: int, window_seconds: int = 60) -> bool:
    """
    Verifica se o limite de requisições foi atingido.
    Retorna True se permitido, False se bloqueado.
    """
    now = time.time()
    window_start = now - window_seconds

    if key not in _rate_limit_cache:
        _rate_limit_cache[key] = []

    # Limpa entradas antigas
    _rate_limit_cache[key] = [t for t in _rate_limit_cache[key] if t > window_start]

    # Verifica limite
    if len(_rate_limit_cache[key]) >= max_requests:
        return False

    # Adiciona nova requisição
    _rate_limit_cache[key].append(now)
    return True


def rate_limit_webhook(func: Callable) -> Callable:
    """Decorator para rate limiting específico de webhooks."""
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        # Usar IP como chave (simplificado - em produção extrair do request)
        key = "webhook_global"  # Pode ser refinado com IP
        if not rate_limit(key, settings.rate_limit_webhook_per_minute, 60):
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit excedido. Tente novamente em breve."
            )
        return await func(*args, **kwargs)
    return wrapper


class CircuitBreaker:
    """
    Circuit Breaker pattern para proteger contra falhas em cascata.
    Estados: CLOSED (normal), OPEN (falha), HALF_OPEN (testando)
    """
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type[Exception] = Exception
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception

        self._failures = 0
        self._last_failure_time: Optional[float] = None
        self._state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    def _set_state(self, state: str) -> None:
        self._state = state
        if state == "CLOSED":
            self._failures = 0
            self._last_failure_time = None

    def _should_attempt_reset(self) -> bool:
        if self._last_failure_time is None:
            return False
        return time.time() - self._last_failure_time >= self.recovery_timeout

    async def call(self, func: Callable, *args: Any, **kwargs: Any) -> Any:
        """
        Executa a função com proteção do circuit breaker.
        """
        if self._state == "OPEN":
            if self._should_attempt_reset():
                self._set_state("HALF_OPEN")
            else:
                raise Exception(f"Circuit breaker OPEN. Última falha: {self._last_failure_time}")

        try:
            result = await func(*args, **kwargs)

            # Sucesso - fecha o circuito se estava semi-aberto
            if self._state == "HALF_OPEN":
                self._set_state("CLOSED")

            return result

        except self.expected_exception as e:
            self._failures += 1
            self._last_failure_time = time.time()

            if self._failures >= self.failure_threshold:
                self._set_state("OPEN")

            raise e


class RedisResilience:
    """
    Wrapper resiliente para operações Redis com retry e fallback.
    """
    def __init__(self, redis_client: Any):
        self.redis = redis_client
        self._memory_fallback: dict[str, Any] = {}

    async def get_with_retry(self, key: str, retries: int = 3, delay: float = 0.1) -> Any:
        """Tenta obter do Redis com retry, fallback para memória."""
        for attempt in range(retries):
            try:
                return self.redis.get(key)
            except Exception:
                if attempt < retries - 1:
                    await asyncio.sleep(delay * (2 ** attempt))  # Exponential backoff
                continue

        # Fallback para memória local
        return self._memory_fallback.get(key)

    async def set_with_retry(
        self, key: str, value: Any, ttl: Optional[int] = None,
        retries: int = 3, delay: float = 0.1
    ) -> bool:
        """Tenta salvar no Redis com retry, fallback para memória."""
        for attempt in range(retries):
            try:
                if ttl:
                    self.redis.setex(key, ttl, value)
                else:
                    self.redis.set(key, value)
                # Também salva no fallback
                self._memory_fallback[key] = value
                return True
            except Exception:
                if attempt < retries - 1:
                    await asyncio.sleep(delay * (2 ** attempt))
                continue

        # Salva apenas no fallback
        self._memory_fallback[key] = value
        return False


class ConversationLock:
    """
    Previne processamento simultâneo da mesma conversa (race conditions).
    """
    def __init__(self):
        self._locks: dict[str, asyncio.Lock] = {}
        self._lock_times: dict[str, float] = {}

    def _cleanup_old_locks(self) -> None:
        now = time.time()
        old_keys = [k for k, t in self._lock_times.items() if now - t > 300]
        for k in old_keys:
            self._locks.pop(k, None)
            self._lock_times.pop(k, None)

    async def acquire(self, conversation_id: str, timeout: float = 10.0) -> bool:
        self._cleanup_old_locks()

        if conversation_id not in self._locks:
            self._locks[conversation_id] = asyncio.Lock()

        self._lock_times[conversation_id] = time.time()

        try:
            await asyncio.wait_for(
                self._locks[conversation_id].acquire(),
                timeout=timeout
            )
            return True
        except asyncio.TimeoutError:
            return False

    def release(self, conversation_id: str) -> None:
        lock = self._locks.get(conversation_id)
        if lock and lock.locked():
            lock.release()


# Instâncias globais
circuit_breaker_llm = CircuitBreaker(failure_threshold=3, recovery_timeout=30)
conversation_locks = ConversationLock()
