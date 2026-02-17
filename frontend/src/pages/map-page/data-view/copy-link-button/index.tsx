import { LinkOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import React from "react";
import { useCopyLinkButton } from "./use-copy-link-button";

export const CopyLinkButton = (): React.JSX.Element => {
  const { messageContext, onClick } = useCopyLinkButton();
  return (
    <Tooltip title="copy link">
      {messageContext}
      <Button
        type="primary"
        shape="circle"
        onClick={onClick}
        icon={<LinkOutlined />}
        size={"large"}
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
        }}
      />
    </Tooltip>
  );
};
