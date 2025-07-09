module.exports = async (req, res) => {
  try {
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    console.log("🧪 Test function started");
    console.log("🔍 Environment check:");
    console.log("  - NODE_ENV:", process.env.NODE_ENV);
    console.log("  - MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("  - JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("  - All env keys:", Object.keys(process.env).filter(key => 
      key.includes('MONGO') || key.includes('JWT') || key.includes('NODE')
    ));

    return res.status(200).json({
      success: true,
      message: "API is working perfectly!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      environmentVariables: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
        mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
      }
    });

  } catch (error) {
    console.error("❌ Error in test function:", error);
    
    return res.status(500).json({
      success: false,
      message: "Test function error",
      error: error.message
    });
  }
};