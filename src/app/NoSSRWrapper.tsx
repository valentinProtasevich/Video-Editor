import dynamic from "next/dynamic";
import React from "react";

// ! can be removed

const NoSSRWrapper = (props) => (
  <React.Fragment>{props.children}</React.Fragment>
);
export default dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
});
