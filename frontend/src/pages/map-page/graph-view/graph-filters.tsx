import React from "react";
import { Flex, Select, Radio } from "antd";

export const GraphFilters = (): React.JSX.Element => {
  return (
    <Flex
      style={{
        gap: "20px",
        position: "sticky",
        top: "0",
        left: "0",
        zIndex: "2",
        minWidth: "500px",
      }}
    >
      <Radio.Group size="large">
        <Radio.Button value="a">Injuries and Deaths</Radio.Button>
        <Radio.Button value="b">Traffic Crashes</Radio.Button>
      </Radio.Group>
      <Select
        mode="multiple"
        placeholder="Street features"
        size="large"
        style={{ width: "300px" }}
        options={[
          {
            label: "Speed Limits",
          },
          {
            label: "Slow Streets",
          },
          {
            label: "Calming Devices",
          },
        ]}
      />
    </Flex>
  );
};
