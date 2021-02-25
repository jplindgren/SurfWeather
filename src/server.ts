import './util/module-alias';
import { Server } from '@overnightjs/core';
import express, { Application } from 'express';
import { ForecastController } from './controllers/forecast';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
  }

  public getApp(): Application {
    return this.app;
  }

  public close(): void {
    //return this.app();
  }

  private setupExpress() : void {
    //bodyParser.json become express.json?
    this.app.use(express.json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
  }
}

//ccreate class inheriting Server overnight
 //constructor call super, default port

 //private setupExpress
  //call bodyparser json middleware

  //create init methoid and call setupexpress