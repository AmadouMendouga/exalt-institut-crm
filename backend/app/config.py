from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    admin_email: str
    admin_password: str
    port: int = 8787
    environment: str = "development"
    sms_gateway_login: str | None = None
    sms_gateway_password: str | None = None
    institute_whatsapp_phone: str | None = None

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
