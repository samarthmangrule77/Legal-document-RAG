import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.routes.auth_routes import router as auth_router
from app.routes.doc_routes import router as doc_router
from app.routes.chat_routes import router as chat_router
from app.routes.compare_routes import router as compare_router
from app.routes.billing_routes import router as billing_router
from app.routes.ws_routes import router as ws_router
from app.routes.generator_routes import router as generator_router
from app.routes.graph_routes import router as graph_router
from app.routes.workflow_routes import router as workflow_router
from app.routes.audit_routes import router as audit_router
from app.routes.memory_routes import router as memory_router
from app.routes.settings_routes import router as settings_router
from app.routes.public_api_routes import router as public_api_router
from app.routes.agent_routes import router as agent_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise AI Legal Document Assistant RAG API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(doc_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(compare_router, prefix=settings.API_V1_STR)
app.include_router(billing_router, prefix=settings.API_V1_STR)
app.include_router(ws_router, prefix=settings.API_V1_STR)
app.include_router(generator_router, prefix=settings.API_V1_STR)
app.include_router(graph_router, prefix=settings.API_V1_STR)
app.include_router(workflow_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(memory_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(public_api_router, prefix=settings.API_V1_STR)
app.include_router(agent_router, prefix=settings.API_V1_STR)

# Frontend Static Assets & SPA Mount
FRONTEND_DIST_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)

if os.path.exists(FRONTEND_DIST_DIR):
    # Mount assets folder if exists
    assets_dir = os.path.join(FRONTEND_DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Catch-all SPA route to serve React app
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow /api and /docs to 404 if not matched by APIRouter
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        target_file = os.path.join(FRONTEND_DIST_DIR, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(FRONTEND_DIST_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "service": settings.PROJECT_NAME,
            "docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
