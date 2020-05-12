import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import Base64Injector from "../components/swagger/Base64Injector.js";

Enzyme.configure({adapter: new Adapter()});

describe("TryInjectSelectedFileAsBase64Method", () => {
  it("is defined", () => {
    expect(Base64Injector.TryInjectSelectedFileAsBase64).toBeDefined();
  });
  
  it("request is not touched for non base64 endpoint", async () => {
    const request = { 
       url: "/api/rebuild/file"
    }

    const actual = await Base64Injector.TryInjectSelectedFileAsBase64(request);

    expect(actual).toBe(request);
  });
  
  it("request is not touched when input is not defined", async () => {
    const request = { 
       url: "/api/rebuild/base64"
    }

    const actual = await Base64Injector.TryInjectSelectedFileAsBase64(request);

    expect(actual).toBe(request);
  });

  it("request is not touched when input is has no value", async () => {
    const request = { 
       url: "/api/rebuild/base64"
    }

    const input = document.createElement("input");
    input.setAttribute("id", "base64Input");
    document.body.append(input);

    const actual = await Base64Injector.TryInjectSelectedFileAsBase64(request);

    expect(actual).toBe(request);
  });
  
  it("request is not touched when input is has empty value", async () => {
    const request = { 
       url: "/api/rebuild/base64"
    }

    const input = document.createElement("input");
    input.setAttribute("id", "base64Input");
    input.value = "";

    document.body.append(input);

    const actual = await Base64Injector.TryInjectSelectedFileAsBase64(request);

    expect(actual).toBe(request);
  });
});