import { fileURLToPath } from "url";
import { expect } from "chai";
import loadTSConfig from "../../src/config-utl/extract-ts-config.js";
import pathToPosix from "../../src/extract/utl/path-to-posix.js";

function getFullPath(pRelativePath) {
  return fileURLToPath(new URL(pRelativePath, import.meta.url));
}
describe("config-utl/parseTSConfig - flatten typescript config - simple config scenarios", () => {
  it("throws when no config file name is passed", () => {
    expect(() => {
      loadTSConfig();
    }).to.throw();
  });

  it("throws when a non-existing config file is passed", () => {
    expect(() => {
      loadTSConfig("config-does-not-exist");
    }).to.throw();
  });

  it("throws when a config file is passed that does not contain valid json", () => {
    expect(() => {
      loadTSConfig(
        getFullPath("./fixtures/typescriptconfig/tsconfig.invalid.json")
      );
    }).to.throw();
  });

  it("returns an empty object when an empty config file is passed", () => {
    expect(
      loadTSConfig(
        getFullPath("./fixtures/typescriptconfig/tsconfig.empty.json")
      ).options
    ).to.deep.equal({
      configFilePath: pathToPosix(
        getFullPath("./fixtures/typescriptconfig/tsconfig.empty.json")
      ),
    });
  });

  it("returns an empty object when an empty config file with comments is passed", () => {
    expect(
      loadTSConfig(
        getFullPath("./fixtures/typescriptconfig/tsconfig.withcomments.json")
      ).options
    ).to.deep.equal({
      configFilePath: pathToPosix(
        getFullPath("./fixtures/typescriptconfig/tsconfig.withcomments.json")
      ),
    });
  });

  it("returns an object with a bunch of options when the default ('--init') config file is passed", () => {
    expect(
      loadTSConfig(
        getFullPath(
          "./fixtures/typescriptconfig/tsconfig.asgeneratedbydefault.json"
        )
      ).options
    ).to.deep.equal({
      configFilePath: pathToPosix(
        getFullPath(
          "./fixtures/typescriptconfig/tsconfig.asgeneratedbydefault.json"
        )
      ),
      esModuleInterop: true,
      module: 1,
      strict: true,
      target: 1,
    });
  });
});

describe("cli/parseTSConfig - flatten typescript config - 'extend' config scenarios", () => {
  it("throws when a config file is passed that contains a extends to a non-existing file", () => {
    expect(() => {
      loadTSConfig(
        getFullPath(
          "./fixtures/typescriptconfig/tsconfig.extendsnonexisting.json"
        )
      );
    }).to.throw();
  });

  it("throws when a config file is passed that has a circular reference", () => {
    expect(() => {
      loadTSConfig(
        getFullPath("./fixtures/typescriptconfig/tsconfig.circular.json")
      );
    }).to.throw(
      "error TS18000: Circularity detected while resolving configuration"
    );
  });

  it("returns an empty object (even no 'extend') when a config with an extend to an empty base is passed", () => {
    expect(
      loadTSConfig(
        getFullPath("./fixtures/typescriptconfig/tsconfig.simpleextends.json")
      ).options
    ).to.deep.equal({
      configFilePath: pathToPosix(
        getFullPath("./fixtures/typescriptconfig/tsconfig.simpleextends.json")
      ),
    });
  });

  it("returns an object with properties from base, extends & overrides from extends - non-compilerOptions", () => {
    const lParseResult = loadTSConfig(
      getFullPath(
        "./fixtures/typescriptconfig/tsconfig.noncompileroptionsextends.json"
      )
    );
    const lWildCardDirectories = {};

    lWildCardDirectories[
      // from TypeScript 4 the key name is lower case ¯\_(ツ)_/¯
      pathToPosix(
        getFullPath("./fixtures/typescriptconfig/override from extends here")
      ).toLowerCase()
    ] = 1;

    /* eslint no-undefined:0 */
    expect(lParseResult).to.deep.equal({
      // only in the base
      // filesSpecs: ["./dummysrc.ts"],
      options: {
        configFilePath: pathToPosix(
          getFullPath(
            "fixtures/typescriptconfig/tsconfig.noncompileroptionsextends.json"
          )
        ),
      },
      fileNames: [
        pathToPosix(getFullPath("fixtures/typescriptconfig/dummysrc.ts")),
        // "/Users/sander/prg/js/dependency-cruiser/test/config-utl/fixtures/typescriptconfig/dummysrc.ts",
      ],
      projectReferences: undefined,
      // validatedIncludeSpecs: ["override from extends here"],
      typeAcquisition: { enable: false, include: [], exclude: [] },
      raw: {
        extends: "./tsconfig.noncompileroptionsbase.json",
        exclude: ["only in the extends"],
        include: ["override from extends here"],
        compileOnSave: false,
        files: ["./dummysrc.ts"],
      },
      watchOptions: undefined,
      errors: [],
      wildcardDirectories: lWildCardDirectories,
      compileOnSave: false,
    });

    // from base:
    // this expect should be ok, but it isn't. For one
    // reason or other typescript's TSConfig parser overrides this again with false
    // even though it isn't specified in the file that extends it =>
    // I suspect a bug in typescripts' TSConfig parser ...
    // expect(lParseResult.compileOnSave).to.equal(true);
  });

  it("returns an object with properties from base, extends & overrides from extends - compilerOptions", () => {
    expect(
      loadTSConfig(
        getFullPath(
          "./fixtures/typescriptconfig/tsconfig.compileroptionsextends.json"
        )
      ).options
    ).to.deep.equal({
      configFilePath: pathToPosix(
        getFullPath(
          "./fixtures/typescriptconfig/tsconfig.compileroptionsextends.json"
        )
      ),
      // only in extends:
      allowJs: true,
      // overridden from base:
      allowUnreachableCode: false,
      // only in base:
      rootDirs: [
        pathToPosix(getFullPath("fixtures/typescriptconfig/foo")),
        pathToPosix(getFullPath("fixtures/typescriptconfig/bar")),
        pathToPosix(getFullPath("fixtures/typescriptconfig/baz")),
      ],
    });
  });

  it("returns an object with properties from base, extends compilerOptions.lib array", () => {
    expect(
      loadTSConfig(
        getFullPath(
          "./fixtures/typescriptconfig/tsconfig.compileroptionsextendslib.json"
        )
      ).options
    ).to.deep.equal({
      configFilePath: pathToPosix(
        getFullPath(
          "./fixtures/typescriptconfig/tsconfig.compileroptionsextendslib.json"
        )
      ),
      lib: [
        // "dom.iterable",
        "lib.dom.iterable.d.ts",
        // I'd expected these from base as well as per the specification, but
        // apparently the typescript TSConfig parser chooses to override instead of extend ...
        // "es2016.array.include",
        // "dom"
      ],
    });
  });
});
