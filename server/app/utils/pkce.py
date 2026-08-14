import hashlib
import base64
import secrets

def generate_pkce_challenge(code_verifier: str) -> str:
    """Generates an S256 code challenge from a code verifier."""
    digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")

def verify_code_challenge(code_verifier: str, code_challenge: str, method: str = "S256") -> bool:
    """
    Verifies that the code_verifier matches the code_challenge using S256.
    Uses constant-time comparison to protect against timing attacks.
    """
    if not code_verifier or not code_challenge:
        return False

    if method.upper() != "S256":
        return False

    try:
        calculated_challenge = generate_pkce_challenge(code_verifier)
        return secrets.compare_digest(calculated_challenge, code_challenge)
    except Exception:
        return False
