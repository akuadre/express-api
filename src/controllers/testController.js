import { sendEmail } from "../utils/sendEmail.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;

    
    // bikin validation email !


    await sendEmail({
      to: email,
      subject: "Test Email",
      html: `
    <h2>Hello bro 👋</h2>
    <p>Ini email test dari Express API lo 🚀</p>
    `,
    });

    return successResponse(res, "Email sent successfully", null, 200);
  } catch (err) {
    console.log("Error: ", err.message);
    return errorResponse(res, "Internal server error", 500);
  }
};
