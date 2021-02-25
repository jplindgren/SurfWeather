declare namespace NodeJS {
  interface Global {
    //necessary import inline otherwise typescript will treat globals.d.ts as local module instead of global
    testRequest: import('supertest').SuperTest<import('supertest').Test>;
  }
}
