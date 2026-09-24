import serverless from "serverless-http";

import {
    app,
    connectDB
} from "../../server.js";

const expressHandler = serverless(app);

const handler = async (event, context) => {
    await connectDB();

    return expressHandler(event, context);
};

export { handler };