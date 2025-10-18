from app import app

# This is the main entry point for Vercel serverless functions
def handler(event, context):
    return app(event, context)

# Export the Flask app
application = app

if __name__ == "__main__":
    app.run()