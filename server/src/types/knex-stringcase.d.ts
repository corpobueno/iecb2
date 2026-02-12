declare module 'knex-stringcase' {
  interface StringcaseOptions {
    app?: 'camel' | 'snake';
    db?: 'camel' | 'snake';
  }

  function stringcase(options: StringcaseOptions): {
    wrapIdentifier: (value: string, origImpl: (value: string) => string) => string;
    postProcessResponse: (result: any) => any;
  };

  export = stringcase;
}
