
import PromptManager from "@/modules/prompts/components/PromptManager";
import { Helmet } from "react-helmet";

const PromptsPage = () => {
  return (
    <>
      <Helmet>
        <title>AI Prompts Manager | WooCommerce AI Tools</title>
      </Helmet>
      <PromptManager />
    </>
  );
};

export default PromptsPage;
