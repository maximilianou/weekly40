# weekly40

## typescript, graphql, nestjs, kubernetes, skaffold dev


### Starting project
---
- nestjs
```
:~/projects/weekly40/app$ nest --help
Usage: nest <command> [options]

Options:
  -v, --version                                   Output the current version.
  -h, --help                                      Output usage information.

Commands:
  new|n [options] [name]                          Generate Nest application.
  build [options] [app]                           Build Nest application.
  start [options] [app]                           Run Nest application.
  info|i                                          Display Nest project details.
  update|u [options]                              Update Nest dependencies.
  add [options] <library>                         Adds support for an external library to your project.
  generate|g [options] <schematic> [name] [path]  Generate a Nest element.
    Available schematics:
      ┌───────────────┬─────────────┬──────────────────────────────────────────────┐
      │ name          │ alias       │ description                                  │
      │ application   │ application │ Generate a new application workspace         │
      │ class         │ cl          │ Generate a new class                         │
      │ configuration │ config      │ Generate a CLI configuration file            │
      │ controller    │ co          │ Generate a controller declaration            │
      │ decorator     │ d           │ Generate a custom decorator                  │
      │ filter        │ f           │ Generate a filter declaration                │
      │ gateway       │ ga          │ Generate a gateway declaration               │
      │ guard         │ gu          │ Generate a guard declaration                 │
      │ interceptor   │ in          │ Generate an interceptor declaration          │
      │ interface     │ interface   │ Generate an interface                        │
      │ middleware    │ mi          │ Generate a middleware declaration            │
      │ module        │ mo          │ Generate a module declaration                │
      │ pipe          │ pi          │ Generate a pipe declaration                  │
      │ provider      │ pr          │ Generate a provider declaration              │
      │ resolver      │ r           │ Generate a GraphQL resolver declaration      │
      │ service       │ s           │ Generate a service declaration               │
      │ library       │ lib         │ Generate a new library within a monorepo     │
      │ sub-app       │ app         │ Generate a new application within a monorepo │
      │ resource      │ res         │ Generate a new CRUD resource                 │
      └───────────────┴─────────────┴──────────────────────────────────────────────┘
```

### Initialize Project
---
- Create nest API
```
:~/projects/weekly40/app$ nest new api
```


### GraphQL Schema First Approach ( nestjs )

<https://docs.nestjs.com/graphql/quick-start>
---
- app/api/src/scripts/generate.ts ( taken from the refenence )
```ts
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: `${__dirname}/../generated/types.ts`,
  outputAs: 'interface',
  emitTypenameField: true,
});
```

#### Write down some GraphQL schema in **.graphql files
---
- app/api/graphql.d/articles.graphql ( changed from one sample )
```gql
type Query {
  articles: [Article]
  article(id: ID!): Article
}

type Mutation {
  createArticle(createArticleInput: CreateArticleInput): Article
}

type Subscription {
  articleCreated: Article
}

type Owner {
  id: Int!
  name: String!
  articles: [Article!]
}

type Article {
  id: Int
  title: String
  content: String
  owner: Owner
}

input CreateArticleInput {
  name: String
  content: String
}
```
#### Execute command to generate types, ( make generate_types )
---
- Generate Schema First :: GraphQL SDL :: **.graphql -> generated/types.ts
```
:~/projects/weekly40/app/api$ ./node_modules/.bin/ts-node src/scripts/generate.ts 
[9:12:21 AM] The definitions have been updated.
```
or in the Makefile
```
generate_types:
	cd app/api && ./node_modules/.bin/ts-node src/scripts/generate.ts
```


#### this was generated from the last command
---
- app/api/src/generated/types.ts
```ts

/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export interface CreateArticleInput {
    name?: string;
    content?: string;
}

export interface IQuery {
    __typename?: 'IQuery';
    articles(): Article[] | Promise<Article[]>;
    article(id: string): Article | Promise<Article>;
}

export interface IMutation {
    __typename?: 'IMutation';
    createArticle(createArticleInput?: CreateArticleInput): Article | Promise<Article>;
}

export interface ISubscription {
    __typename?: 'ISubscription';
    articleCreated(): Article | Promise<Article>;
}

export interface Owner {
    __typename?: 'Owner';
    id: number;
    name: string;
    articles?: Article[];
}

export interface Article {
    __typename?: 'Article';
    id?: number;
    title?: string;
    content?: string;
    owner?: Owner;
}
```

-----
-----
#### Generate from GraphQL Schema First, over resolver, data in memory in service, response and playground http://localhost:4000/graphql
---
- Makefile
```
.PHONY: step01
step01:
	npm i -g @nestjs/cli

app:
	mkdir app		
step02: app
	cd app && nest new api
step03:
	cd app/api && npm install @nestjs/graphql graphql-tools graphql apollo-server-express class-validator uuid

generate_types:
	cd app/api && ./node_modules/.bin/ts-node src/scripts/generate.ts
	
step04:
	curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d '{ "query":"query { article(  id: 1 ){ id, title, content } }"}'
```

---
- app/api/src/scripts/generate.ts ( make generate_types )
```ts
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: `${__dirname}/../generated/types.ts`,
  outputAs: 'class',
  emitTypenameField: true,
});
```

---
- app/api/src/graphql.d/articles.graphql
```gql
type Query {
  articles: [Article]
  article(id: ID!): Article
}
type Mutation {
  createArticle(createArticleInput: CreateArticleInput): Article
}
type Subscription {
  articleCreated: Article
}
type Owner {
  id: ID!
  name: String!
  articles: [Article!]
}
type Article {
  id: ID!
  title: String
  content: String
  owner: Owner
}
input CreateArticleInput {
  name: String
  content: String
}
```

---
- app/src/main.ts
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4000);
}
bootstrap();
```
---
- app/api/src/app.module.ts
```ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ArticlesModule } from './articles/articles.module';
@Module({
  imports: [
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql']
    }),
    ArticlesModule],
  providers: [],
})
export class AppModule {}
```

---
- app/api/src/articles/articles.module.ts
```ts
import { Module } from "@nestjs/common";
import { AuthorResolver } from "./articles.resolver";
import { ArticlesService } from "./articles.service";
@Module({
  providers:[
    ArticlesService, 
    AuthorResolver
  ]
})
export class ArticlesModule{}
```

---
- app/api/src/articles/articles.resolver.ts
```ts
import { Args, Query, Resolver } from "@nestjs/graphql";
import { Article } from "src/generated/types";
import { ArticlesService } from "./articles.service";
@Resolver( () => Article )
export class AuthorResolver {
  constructor(
    private readonly articlesService: ArticlesService
  ){}
  @Query(() => Article, { name: 'article', nullable: true})
  getArticle(@Args('id') id: string ){
    //console.debug(`AuthorResolver::getArticle(${id}) id:${typeof id}`);
    return this.articlesService.findOneById(id);
  }
}
```

---
- app/api/src/articles/articles.service.ts
```ts
import { Injectable } from "@nestjs/common";
import { Article } from "src/generated/types";
@Injectable()
export class ArticlesService{
  private articles: Article[] = [
    { id:'1', 
      title:'The local kube', 
      content:'Working with kubernetes and nest locally.' 
    }
  ];
  public findOneById(id: string){
    //console.debug(`ArticlesService::findOneById(${id}) ${typeof id} ${typeof this.articles[0].id}`);
    //console.debug(`ArticlesService::findOneById(${id}):: ${this.articles.find( art => art.id === id )}`);
    return this.articles.find( article => article.id === id );
  }
}
```

---
- response over command line
```
:~/projects/weekly40$ make step04
curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d '{ "query":"query { article(  id: 1 ){ id, title, content } }"}'
{"data":{"article":{"id":"1","title":"The local kube","content":"Working with kubernetes and nest locally."}}}
```

-----
-----

#### kubernetes - Create new local cluster - k3d cluster create --config kube/myk3dcluster.yaml

---
- kube/myk3dcluster.yaml
```
# k3d configuration file, saved as e.g. /home/me/myk3dcluster.yaml
apiVersion: k3d.io/v1alpha2 # this will change in the future as we make everything more stable
kind: Simple # internally, we also have a Cluster config, which is not yet available externally
name: localcluster # name that you want to give to your cluster (will still be prefixed with `k3d-`)
servers: 1 # same as `--servers 1`
agents: 2 # same as `--agents 2`
kubeAPI: # same as `--api-port myhost.my.domain:6445` (where the name would resolve to 127.0.0.1)
  host: "local" # important for the `server` setting in the kubeconfig
  hostIP: "127.0.0.1" # where the Kubernetes API will be listening on
  hostPort: "6445" # where the Kubernetes API listening port will be mapped to on your host system
image: rancher/k3s:v1.20.4-k3s1 # same as `--image rancher/k3s:v1.20.4-k3s1`
network: my-custom-net # same as `--network my-custom-net`
token: superSecretToken # same as `--token superSecretToken`
volumes: # repeatable flags are represented as YAML lists
  - volume: /home/maximilianou/projects/weekly40/kube:/usr/local/mount # same as `--volume '/my/host/path:/path/in/node@server[0];agent[*]'`
    nodeFilters:
      - server[0]
      - agent[*]
ports:
  - port: 8080:80 # same as `--port '8080:80@loadbalancer'`
    nodeFilters:
      - loadbalancer
labels:
  - label: foo=bar # same as `--label 'foo=bar@agent[1]'`
    nodeFilters:
      - agent[1]
env:
  - envVar: bar=baz # same as `--env 'bar=baz@server[0]'`
    nodeFilters:
      - server[0]
#registries: # define how registries should be created or used
#  create: true # creates a default registry to be used with the cluster; same as `--registry-create`
#  use:
#    - localhost:5000 # some other k3d-managed registry; same as `--registry-use 'k3d-myotherregistry:5000'`
#  config: | # define contents of the `registries.yaml` file (or reference a file); same as `--registry-config /path/to/config.yaml`
#    mirrors:
#      "my.company.registry":
#        endpoint:
#          - http://my.company.registry:5000
options:
  k3d: # k3d runtime settings
    wait: true # wait for cluster to be usable before returining; same as `--wait` (default: true)
    timeout: "60s" # wait timeout before aborting; same as `--timeout 60s`
    disableLoadbalancer: false # same as `--no-lb`
    disableImageVolume: false # same as `--no-image-volume`
    disableRollback: false # same as `--no-Rollback`
    disableHostIPInjection: false # same as `--no-hostip`
  k3s: # options passed on to K3s itself
    extraServerArgs: # additional arguments passed to the `k3s server` command; same as `--k3s-server-arg`
      - --tls-san=local
    extraAgentArgs: [] # addditional arguments passed to the `k3s agent` command; same as `--k3s-agent-arg`
#  kubeconfig:
#    updateDefaultKubeconfig: true # add new cluster to your default Kubeconfig; same as `--kubeconfig-update-default` (default: true)
#    switchCurrentContext: true # also set current-context to the new cluster's context; same as `--kubeconfig-switch-context` (default: true)
#  runtime: # runtime (docker) specific options
#    gpuRequest: all # same as `--gpus all`
```


#### kubernetes Switch context - kubectl config use-context [mycontext]
```
:~/projects$ kubectl config get-contexts
CURRENT   NAME               CLUSTER            AUTHINFO                 NAMESPACE
          k3d-localcluster   k3d-localcluster   admin@k3d-localcluster   
*         k3d-one-cluster    k3d-one-cluster    admin@k3d-one-cluster    
```

```
:~/projects$ kubectl config use-context k3d-localcluster
Switched to context "k3d-localcluster".
```

```
:~/projects/weekly40$ kubectl config get-contexts
CURRENT   NAME               CLUSTER            AUTHINFO                 NAMESPACE
*         k3d-localcluster   k3d-localcluster   admin@k3d-localcluster   
          k3d-one-cluster    k3d-one-cluster    admin@k3d-one-cluster 
```

#### 1. RBAC - Role Based Access Control - ServiceAccount

```
:~/projects/weekly40/kube$ kubectl create -f traefik-service-acc-02.yaml 
serviceaccount/traefik-ingress created
```

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: traefik-ingress
  namespace: kube-system
```

- ClusterRole
```
:~/projects/weekly40/kube$ kubectl create -f traefik-cr-03.yaml
clusterrole.rbac.authorization.k8s.io/traefik-ingress created
```

```yaml
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: traefik-ingress
rules:
  - apiGroups:
      - ""
    resources:
      - services
      - endpoints
      - secrets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
    resources:
      - ingresses
    verbs:
      - get
      - list
      - watch
```

- Binding - ClusterRole <-> ServiceAccount
```
:~/projects/weekly40/kube$ kubectl create -f traefik-crb-04.yaml
clusterrolebinding.rbac.authorization.k8s.io/traefik-ingress created
```

```yaml
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: traefik-ingress
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: traefik-ingress
subjects:
- kind: ServiceAccount
  name: traefik-ingress
  namespace: kube-system
```

#### 2. Deploy traefik to a Cluster

```
:~/projects/weekly40/kube$ kubectl create -f traefik-deployment-05.yaml
deployment.apps/traefik-ingress-controller created
```

```yaml
kind: Deployment
apiVersion: apps/v1
metadata:
  name: traefik-ingress-controller
  namespace: kube-system
  labels:
    k8s-app: traefik-ingress-lb
spec:
  replicas: 1
  selector:
    matchLabels:
      k8s-app: traefik-ingress-lb
  template:
    metadata:
      labels:
        k8s-app: traefik-ingress-lb
        name: traefik-ingress-lb
    spec:
      serviceAccountName: traefik-ingress-controller
      terminationGracePeriodSeconds: 60
      containers:
      - image: traefik
        name: traefik-ingress-lb
        ports:
        - name: http
          containerPort: 80
        - name: admin
          containerPort: 8080
        args:
        - --api
        - --kubernetes
        - --logLevel=INFO
```

```
:~/projects/weekly40/kube$ kubectl create -f traefik-svc-06.yaml
service/traefik-ingress-service created
```

```yaml
kind: Service
apiVersion: v1
metadata:
  name: traefik-ingress-service
  namespace: kube-system
spec:
  selector:
    k8s-app: traefik-ingress-lb
  ports:
    - protocol: TCP
      port: 80
      name: web
    - protocol: TCP
      port: 8080
      name: admin
  type: NodePort
```

- verify creation of service
```
:~/projects/weekly40/kube$ kubectl describe svc traefik-ingress-service --namespace=kube-system
Name:                     traefik-ingress-service
Namespace:                kube-system
Labels:                   <none>
Annotations:              <none>
Selector:                 k8s-app=traefik-ingress-lb
Type:                     NodePort
IP Families:              <none>
IP:                       10.43.241.19
IPs:                      10.43.241.19
Port:                     web  80/TCP
TargetPort:               80/TCP
NodePort:                 web  30763/TCP
Endpoints:                <none>
Port:                     admin  8080/TCP
TargetPort:               8080/TCP
NodePort:                 admin  30223/TCP
Endpoints:                <none>
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>
```

```
:~/projects/weekly40/kube$ kubectl create -f traefik-webui-svc-07.yaml
service/traefik-web-ui created
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: traefik-web-ui
  namespace: kube-system
spec:
  selector:
    k8s-app: traefik-ingress-lb
  ports:
  - name: web
    port: 80
    targetPort: 8080
```

***( Houston, we have a problem! The external IP address was not assigned! )***

-----
```
read the docs
```
-----

### Each context is a triple (cluster, user, namespace)

<https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/>


kubectl config --kubeconfig=config-demo view --minify

kubectl config --kubeconfig=config-demo use-context dev-storage

kubectl config --kubeconfig=config-demo view --minify


export KUBECONFIG=$KUBECONFIG:config-demo:config-demo-2

kubectl config view

-----

```yaml
apiVersion: v1
kind: Config
preferences: {}

clusters:
- cluster:
    insecure-skip-tls-verify: true
    server: https://127.0.0.1
  name: dev-cluster

users:
- name: dev-user
  user:
    password: dev-pass
    username: dev-user
    
contexts:
- context:
    cluster: dev-cluster
    namespace: dev-namespace
    user: dev-user
  name: dev-context
```

```
:~/projects/weekly40/kube/tut2021$ kubectl config --kubeconfig=cluster-multi.yaml set-cluster dev-cluster --server=https://127.0.0.1 --insecure-skip-tls-verify
Cluster "dev-cluster" set.
```

```
:~/projects/weekly40/kube/tut2021$ kubectl config --kubeconfig=cluster-multi.yaml view
apiVersion: v1
clusters:
- cluster:
    insecure-skip-tls-verify: true
    server: https://127.0.0.1
  name: dev-cluster
contexts:
- context:
    cluster: dev-cluster
    namespace: dev-namespace
    user: dev-user
  name: dev-context
current-context: ""
kind: Config
preferences: {}
users:
- name: dev-user
  user:
    password: dev-pass
    username: dev-user
```

```
:~/projects/weekly40/kube/tut2021$ kubectl config get-clusters
NAME
k3d-localcluster
k3d-one-cluster
:~/projects/weekly40/kube/tut2021$ kubectl config get-contexts
CURRENT   NAME               CLUSTER            AUTHINFO                 NAMESPACE
*         k3d-localcluster   k3d-localcluster   admin@k3d-localcluster   
          k3d-one-cluster    k3d-one-cluster    admin@k3d-one-cluster   
```

---
---
- k3d create cluster file k3d-cluster-create-config-dev.yaml
```
:~/projects/weekly40/kube/tut2021$ k3d cluster create --config k3d-cluster-create-config-dev.yaml
```

<https://k3d.io/usage/configfile/>

- k3d delete cluster dev-cluster
```
:~/projects/weekly40/kube/tut2021$ k3d cluster delete dev-cluster
```

- kubctl get context
```
kubectl config use-context k3d-dev-cluster
kubectl cluster-info
:~/projects/weekly40/kube/tut2021$ kubectl config get-contexts
CURRENT   NAME               CLUSTER            AUTHINFO                 NAMESPACE
*         k3d-dev-cluster    k3d-dev-cluster    admin@k3d-dev-cluster    
          k3d-localcluster   k3d-localcluster   admin@k3d-localcluster   
          k3d-one-cluster    k3d-one-cluster    admin@k3d-one-cluster 
```

### Kubernetes kind
- kind: Pod, Service, Deployment, ConfigMap, Secret

..

- apiVersion: v1 or apps/v1

- apiVersion: v1
  - kind: Pod
  - kind: Service
  - kind: Secret
- apiVersion: apps/v1
  - kind: Deployment

```
:~/projects/weekly40/kube/tut2021$ kubectl api-resources
NAME                              SHORTNAMES   APIVERSION                             NAMESPACED   KIND
bindings                                       v1                                     true         Binding
componentstatuses                 cs           v1                                     false        ComponentStatus
configmaps                        cm           v1                                     true         ConfigMap
endpoints                         ep           v1                                     true         Endpoints
events                            ev           v1                                     true         Event
limitranges                       limits       v1                                     true         LimitRange
namespaces                        ns           v1                                     false        Namespace
nodes                             no           v1                                     false        Node
persistentvolumeclaims            pvc          v1                                     true         PersistentVolumeClaim
persistentvolumes                 pv           v1                                     false        PersistentVolume
pods                              po           v1                                     true         Pod
podtemplates                                   v1                                     true         PodTemplate
replicationcontrollers            rc           v1                                     true         ReplicationController
resourcequotas                    quota        v1                                     true         ResourceQuota
secrets                                        v1                                     true         Secret
serviceaccounts                   sa           v1                                     true         ServiceAccount
services                          svc          v1                                     true         Service
mutatingwebhookconfigurations                  admissionregistration.k8s.io/v1        false        MutatingWebhookConfiguration
validatingwebhookconfigurations                admissionregistration.k8s.io/v1        false        ValidatingWebhookConfiguration
customresourcedefinitions         crd,crds     apiextensions.k8s.io/v1                false        CustomResourceDefinition
apiservices                                    apiregistration.k8s.io/v1              false        APIService
controllerrevisions                            apps/v1                                true         ControllerRevision
daemonsets                        ds           apps/v1                                true         DaemonSet
deployments                       deploy       apps/v1                                true         Deployment
replicasets                       rs           apps/v1                                true         ReplicaSet
statefulsets                      sts          apps/v1                                true         StatefulSet
tokenreviews                                   authentication.k8s.io/v1               false        TokenReview
localsubjectaccessreviews                      authorization.k8s.io/v1                true         LocalSubjectAccessReview
selfsubjectaccessreviews                       authorization.k8s.io/v1                false        SelfSubjectAccessReview
selfsubjectrulesreviews                        authorization.k8s.io/v1                false        SelfSubjectRulesReview
subjectaccessreviews                           authorization.k8s.io/v1                false        SubjectAccessReview
horizontalpodautoscalers          hpa          autoscaling/v1                         true         HorizontalPodAutoscaler
cronjobs                          cj           batch/v1beta1                          true         CronJob
jobs                                           batch/v1                               true         Job
certificatesigningrequests        csr          certificates.k8s.io/v1                 false        CertificateSigningRequest
leases                                         coordination.k8s.io/v1                 true         Lease
endpointslices                                 discovery.k8s.io/v1beta1               true         EndpointSlice
events                            ev           events.k8s.io/v1                       true         Event
ingresses                         ing          extensions/v1beta1                     true         Ingress
flowschemas                                    flowcontrol.apiserver.k8s.io/v1beta1   false        FlowSchema
prioritylevelconfigurations                    flowcontrol.apiserver.k8s.io/v1beta1   false        PriorityLevelConfiguration
helmchartconfigs                               helm.cattle.io/v1                      true         HelmChartConfig
helmcharts                                     helm.cattle.io/v1                      true         HelmChart
addons                                         k3s.cattle.io/v1                       true         Addon
nodes                                          metrics.k8s.io/v1beta1                 false        NodeMetrics
pods                                           metrics.k8s.io/v1beta1                 true         PodMetrics
ingressclasses                                 networking.k8s.io/v1                   false        IngressClass
ingresses                         ing          networking.k8s.io/v1                   true         Ingress
networkpolicies                   netpol       networking.k8s.io/v1                   true         NetworkPolicy
runtimeclasses                                 node.k8s.io/v1                         false        RuntimeClass
poddisruptionbudgets              pdb          policy/v1beta1                         true         PodDisruptionBudget
podsecuritypolicies               psp          policy/v1beta1                         false        PodSecurityPolicy
clusterrolebindings                            rbac.authorization.k8s.io/v1           false        ClusterRoleBinding
clusterroles                                   rbac.authorization.k8s.io/v1           false        ClusterRole
rolebindings                                   rbac.authorization.k8s.io/v1           true         RoleBinding
roles                                          rbac.authorization.k8s.io/v1           true         Role
priorityclasses                   pc           scheduling.k8s.io/v1                   false        PriorityClass
csidrivers                                     storage.k8s.io/v1                      false        CSIDriver
csinodes                                       storage.k8s.io/v1                      false        CSINode
storageclasses                    sc           storage.k8s.io/v1                      false        StorageClass
volumeattachments                              storage.k8s.io/v1                      false        VolumeAttachment
```

---
Environment: 

* Stage: ( dev, qa, prod )
* Delivery ( 4.1, 4.2, 4.3, 4.4, 4.5 quality assurance to acceptance test)
* Release ( 4.5 stable )

---
- Mistake Cluster Delete k3d vs kubectl - named cluster localcluster ( and not k3d-localcluster )

localcluster - cluster named:

```
:~/projects/weekly40/kube/tut2021$ k3d cluster delete --verbose k3d-localcluster
DEBU[0000] Runtime Info:
&{Name:docker Endpoint:/var/run/docker.sock Version:20.10.6 OSType:linux OS:Debian GNU/Linux 10 (buster) Arch:x86_64 CgroupVersion:1 CgroupDriver:cgroupfs Filesystem:extfs} 
INFO[0000] No clusters found                            

:~/projects/weekly40/kube/tut2021$ k3d cluster list
NAME           SERVERS   AGENTS   LOADBALANCER
localcluster   1/1       2/2      true
one-cluster    1/1       0/0      true

:~/projects/weekly40/kube/tut2021$ kubectl config get-clusters
NAME
k3d-localcluster
k3d-one-cluster
```

- Successfully deleted cluster loadcluster
```
:~/projects/weekly40/kube/tut2021$ k3d cluster delete localcluster --verbose
DEBU[0000] Runtime Info:
&{Name:docker Endpoint:/var/run/docker.sock Version:20.10.6 OSType:linux OS:Debian GNU/Linux 10 (buster) Arch:x86_64 CgroupVersion:1 CgroupDriver:cgroupfs Filesystem:extfs} 
INFO[0000] Deleting cluster 'localcluster'              
DEBU[0000] Cluster Details: &{Name:localcluster Network:{Name:my-custom-net ID: External:true IPAM:{IPPrefix:invalid IP prefix IPsUsed:[] Managed:false}} Token:superSecretToken Nodes:[0xc00062a000 0xc00036a9a0 0xc00036af20 0xc0004e4840] InitNode:<nil> ExternalDatastore:<nil> KubeAPI:<nil> ServerLoadBalancer:<nil> ImageVolume:k3d-localcluster-images} 
DEBU[0000] Deleting node k3d-localcluster-serverlb ...  
INFO[0000] Deleted k3d-localcluster-serverlb            
DEBU[0000] Deleting node k3d-localcluster-agent-1 ...   
INFO[0008] Deleted k3d-localcluster-agent-1             
DEBU[0008] Deleting node k3d-localcluster-agent-0 ...   
INFO[0015] Deleted k3d-localcluster-agent-0             
DEBU[0015] Deleting node k3d-localcluster-server-0 ...  
INFO[0021] Deleted k3d-localcluster-server-0            
DEBU[0021] Skip deletion of cluster network 'my-custom-net' because it's managed externally 
INFO[0021] Deleting image volume 'k3d-localcluster-images' 
INFO[0021] Removing cluster details from default kubeconfig... 
DEBU[0021] Using default kubeconfig '/home/maximilianou/.kube/config' 
DEBU[0021] Wrote kubeconfig to '/home/maximilianou/.kube/config' 
INFO[0021] Removing standalone kubeconfig file (if there is one)... 
INFO[0021] Successfully deleted cluster localcluster!  
```

---
- 
```
```