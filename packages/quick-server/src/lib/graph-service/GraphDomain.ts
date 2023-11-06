import { DocumentNode } from 'graphql';

export interface GraphDomainArgs {
  typeDef: DocumentNode;
  resolver: any;
}
export class GraphDomain {
  public typeDef: DocumentNode;
  public resolver: any;

  constructor(args: GraphDomainArgs) {
    this.typeDef = args.typeDef;
    this.resolver = args.resolver;
  }
}
