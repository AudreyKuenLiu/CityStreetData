import React from "react";
import { message } from "antd";
import {
  useCnns,
  useEndDate,
  useStartDate,
  useTimeSegment,
} from "../../store/street-map-data-form";
import { useDataViewContext } from "../../context/data-view";
import { compressToBase64 } from "lz-string";

interface useCopyLinkButtonReturn {
  onClick: () => void;
  messageContext: React.ReactElement;
}

export const useCopyLinkButton = (): useCopyLinkButtonReturn => {
  const [messageApi, contextHolder] = message.useMessage();
  const startDate = useStartDate();
  const endDate = useEndDate();
  const cnns = useCnns();
  const timeSegment = useTimeSegment();
  const { currentDataView } = useDataViewContext();
  const urlParams = {
    startDate,
    endDate,
    cnns: cnns.map((streetSegment) => {
      return streetSegment.cnn;
    }),
    timeSegment,
    currentDataView,
  };

  const onClick = (): void => {
    messageApi.success("Link Copied");
    const urlParamsStr = JSON.stringify(urlParams);
    const compressedURLStr = compressToBase64(urlParamsStr);
    console.log(
      urlParamsStr,
      urlParamsStr.length,
      compressedURLStr,
      compressedURLStr.length,
    );
  };

  return {
    messageContext: contextHolder,
    onClick,
  };
};
