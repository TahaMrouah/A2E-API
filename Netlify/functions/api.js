import serverless from "serverless-http";

import {
    app,
    connectDB
} from "../../server.js";

const handler = async (event, context) => {
    await connectDB();

    const expressHandler = serverless(app);

    return expressHandler(event, context);
};

export { handler };