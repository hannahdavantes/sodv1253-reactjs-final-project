import twilio from "twilio";

export const getChatToken = async (req, res) => {
  try {
    const user = req.user;

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    const identity = `${process.env.TWILIO_CHAT_IDENTITY_PREFIX}-${user.id}-${user.firstName}-${user.lastName}`;

    const AccessToken = twilio.jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      {
        identity,
        ttl: 60 * 60,
      },
    );

    const chatGrant = new ChatGrant({
      serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
    });

    token.addGrant(chatGrant);

    const serviceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID;
    const uniqueName = process.env.TWILIO_CONVERSATION_UNIQUE_NAME;

    const conversations = await twilioClient.conversations.v1
      .services(serviceSid)
      .conversations.list({ limit: 50 });

    const existingConversation = conversations.find(
      (conversation) => conversation.uniqueName === uniqueName,
    );

    const conversation =
      existingConversation ??
      (await twilioClient.conversations.v1
        .services(serviceSid)
        .conversations.create({
          uniqueName,
          friendlyName: "Global Stock Chat",
        }));

    const participants = await twilioClient.conversations.v1
      .services(serviceSid)
      .conversations(conversation.sid)
      .participants.list();

    const alreadyParticipant = participants.some(
      (p) => p.identity === identity,
    );

    if (!alreadyParticipant) {
      await twilioClient.conversations.v1
        .services(serviceSid)
        .conversations(conversation.sid)
        .participants.create({ identity });
    }

    res.json({
      token: token.toJwt(),
      identity,
      conversationUniqueName: uniqueName,
      serviceSid,
    });
  } catch (error) {
    console.error("Chat token error status:", error.status);
    console.error("Chat token error code:", error.code);
    console.error("Chat token error message:", error.message);

    res.status(500).json({
      message: "Failed to generate chat token",
      error: error.message,
    });
  }
};
