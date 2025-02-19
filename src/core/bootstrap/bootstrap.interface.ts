export default interface IBootstrap {
  initialize(): Promise<any>;
  close(): void;
}