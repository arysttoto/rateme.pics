import React from "react";

const RateMeTerms: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 text-gray-800 bg-white shadow-lg rounded-2xl">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions of RateMe</h1>

      <p className="mb-4">
        By submitting your photo, you grant RateMe a non-exclusive, revocable license to display your image on our
        platform. You understand that users may rate your image subjectively, sometimes kindly, sometimes... less so.
      </p>

      <p className="mb-4">
        You acknowledge that the ratings are for entertainment purposes only, and do not constitute a reflection of
        personal value, character, attractiveness, or eligibility for high society. Any offense taken is unfortunate,
        but ultimately on you. Sorry.
      </p>

      <p className="mb-4">
        Your image will be publicly visible until you choose to remove it. You may revoke your consent at any time by
        visiting your profile settings and clicking “Please stop judging me.”
      </p>

      <p className="mb-4">
        We store your photo in accordance with reasonable security practices, and definitely do not sell it to AI model
        trainers in mysterious foreign data labs. Probably.
      </p>

      <p className="mb-4">
        By continuing, you confirm that you are over 18, or at least a very mature-looking teenager with full
        parental consent and a strong grasp of satire.
      </p>

      <p className="mt-6 text-sm text-gray-500 italic">
        If any of this sounds legally binding, that's your interpretation, not ours. But thanks for playing.
      </p>
    </div>
  );
};

export default RateMeTerms;
