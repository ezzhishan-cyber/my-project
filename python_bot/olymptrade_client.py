"""
Olymp Trade WebSocket API Client (Demo Mode Support)
Inspired by ChipaDevTeam/OlympTradeAPI and community wrappers
"""

import asyncio
import json
import logging
import time
from typing import Callable, Optional, Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("OlympTradeClient")


class OlympTradeClient:
    WS_URL = "wss://olymptrade.com/ds/v3"

    def __init__(self, access_token: Optional[str] = None, demo_only: bool = True):
        self.access_token = access_token
        self.demo_only = demo_only
        self.websocket = None
        self.is_connected = False
        self.demo_account_id = None
        self.demo_balance = 1000.00
        self.candle_callbacks = []
        self._running = False

    async def connect(self):
        """Establish WebSocket connection with session access_token"""
        if not self.access_token:
            logger.info("No session token provided. Operating in high-precision Local Demo Sandbox.")
            self.is_connected = True
            return True

        try:
            import websockets
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Cookie": f"access_token={self.access_token}",
            }
            logger.info(f"Connecting to Olymp Trade WebSocket at {self.WS_URL}...")
            self.websocket = await websockets.connect(self.WS_URL, extra_headers=headers)
            self.is_connected = True
            logger.info("Successfully connected to Olymp Trade WebSocket!")
            asyncio.create_task(self._listen_loop())
            await self._authenticate()
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Olymp Trade WebSocket: {e}")
            logger.info("Falling back to internal simulated Demo Account mode ($1,000 balance).")
            self.is_connected = True
            return False

    async def _authenticate(self):
        """Authenticate session and retrieve demo account ID"""
        if not self.websocket:
            return
        auth_msg = [
            {
                "t": 1,
                "e": 100,
                "d": [{"access_token": self.access_token}],
            }
        ]
        await self.websocket.send(json.dumps(auth_msg))

    async def _listen_loop(self):
        """Incoming message listener"""
        try:
            async for raw in self.websocket:
                msg = json.loads(raw)
                await self._handle_message(msg)
        except Exception as e:
            logger.warning(f"WebSocket listener terminated: {e}")
            self.is_connected = False

    async def _handle_message(self, message: Any):
        """Parse server responses and candle streams"""
        if isinstance(message, list):
            for item in message:
                # Handle balance update
                if item.get("e") == 102:
                    data = item.get("d", [])
                    demo_acc = next((a for a in data if a.get("group") == "demo"), None)
                    if demo_acc:
                        self.demo_account_id = demo_acc.get("account_id")
                        self.demo_balance = float(demo_acc.get("amount", 1000.0))
                        logger.info(f"Olymp Trade Demo Balance: ${self.demo_balance:.2f} (ID: {self.demo_account_id})")

    async def place_order(
        self,
        pair: str,
        direction: str,
        amount: float = 25.0,
        duration: int = 300,  # 00h05min00sec = 300 seconds
        group: str = "demo",
    ) -> Dict[str, Any]:
        """
        Execute fixed-time binary trade locked strictly on demo account
        """
        assert group == "demo", "SAFETY GUARD: Only demo account trades are permitted."
        direction = direction.lower()  # 'up' or 'down'

        logger.info(
            f"Placing 5-Minute {direction.upper()} order on {pair} for ${amount:.2f} (Group: {group}, Duration: {duration}s)"
        )

        if self.websocket and self.demo_account_id:
            payload = [
                {
                    "t": 1,
                    "e": 200,
                    "d": [
                        {
                            "pair": pair,
                            "dir": direction,
                            "amount": amount,
                            "duration": duration,
                            "group": "demo",
                            "account_id": self.demo_account_id,
                        }
                    ],
                }
            ]
            await self.websocket.send(json.dumps(payload))
            return {"status": "SUBMITTED_TO_OLYMPTRADE", "pair": pair, "amount": amount, "duration": duration}

        # Simulated demo execution
        self.demo_balance -= amount
        return {
            "status": "EXECUTED_DEMO",
            "pair": pair,
            "direction": direction,
            "amount": amount,
            "duration": duration,
            "remaining_balance": self.demo_balance,
        }

    async def close(self):
        if self.websocket:
            await self.websocket.close()
            self.is_connected = False
            logger.info("Olymp Trade WebSocket client disconnected.")
