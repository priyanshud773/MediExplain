from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..oauth2 import oauth2_scheme
from .. import token, database, models


def get_current_user(
    token_value: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):

    email = token.verify_token(token_value)

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user