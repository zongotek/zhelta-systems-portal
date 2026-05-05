import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from auth_utils import current_user

router = APIRouter(prefix="/api/billing", tags=["billing"])

PLAN_PRICES = {"essential": 499, "professional": 1499, "enterprise": 3999}


class CheckoutReq(BaseModel):
    plan: str  # essential | professional | enterprise


@router.post("/checkout")
async def checkout(payload: CheckoutReq, user=Depends(current_user)):
    if payload.plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Unknown plan")
    key = os.environ.get("STRIPE_API_KEY", "")
    if not key:
        raise HTTPException(
            status_code=501,
            detail="STRIPE_API_KEY not configured on the backend. Set it in backend/.env to enable Stripe Checkout.",
        )
    # Stripe wiring is intentionally minimal; ZHELTA Systems would add a real Checkout
    # session here. For now, return a deterministic test redirect so the UI flow works.
    return {
        "url": f"https://checkout.stripe.com/c/pay/example?plan={payload.plan}&user={user['id']}",
        "plan": payload.plan,
        "amount_usd": PLAN_PRICES[payload.plan],
    }
