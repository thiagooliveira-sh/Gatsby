---
image: /assets/img/AWS.png
title: Amazon EKS Arquitetura e Primeiros Passos
description: Containers trouxeram agilidade e padronização para o
  desenvolvimento moderno, mas orquestrar workloads em escala exige muito mais
  do que apenas subir pods. No contexto da AWS, o Amazon EKS simplifica a
  operação do Kubernetes ao oferecer um control plane totalmente gerenciado,
  altamente disponível e integrado ao ecossistema da nuvem.
date: 2026-03-27
category: aws
background: "#FF9900"
tags:
  - AWSEKS
  - AMAZONEKS
  - KUBERNETESNAAWS
  - CONTAINERORCHESTRATION
  - CLOUDNATIVE
  - ARQUITETURACLOUD
  - KUBERNETESARCHITECTURE
  - AMAZONVPC
  - DEVOPS
  - PLATFORMENGINEERING
  - CLUSTERKUBERNETES
  - CLOUDINFRASTRUCTURE
  - CONTAINERSNAAWS
categories:
  - AWSEKS
  - AMAZONEKS
  - KUBERNETESNAAWS
  - CONTAINERORCHESTRATION
  - CLOUDNATIVE
  - ARQUITETURACLOUD
  - KUBERNETESARCHITECTURE
  - AMAZONVPC
  - DEVOPS
  - PLATFORMENGINEERING
  - CLUSTERKUBERNETES
  - CLOUDINFRASTRUCTURE
  - CONTAINERSNAAWS
---
Executar Kubernetes em produção vai muito além de criar um cluster e subir aplicações. É preciso entender como o control plane se comunica com os nós, como o modelo de rede influencia a comunicação entre pods e serviços, e quais decisões arquiteturais impactam segurança, custo e escalabilidade. No contexto da AWS, o Amazon EKS remove a complexidade de gerenciar o plano de controle, mas ainda exige escolhas conscientes sobre VPC, IAM, node groups, add-ons e observabilidade.

Neste artigo, você vai aprender:

* Como o Amazon EKS funciona internamente
* Arquitetura do control plane e data plane
* Tipos de nodes e quando usar cada um
* Plugins essenciais (VPC CNI, CoreDNS, kube-proxy)
* Modelos de autenticação (aws-auth vs Access Entries)
* Pod Identity para acesso a serviços AWS
* Rede no EKS: como pods se comunicam
* Observabilidade e logging
* Evoluções recentes: Karpenter e EKS Auto Mode

No final, você terá uma compreensão profunda de como o EKS funciona e como tomar decisões arquiteturais informadas.

## Arquitetura do Amazon EKS

### Control Plane vs Data Plane

O EKS separa claramente duas responsabilidades:

**Control Plane (gerenciado pela AWS)**:
* API Server (kube-apiserver)
* Scheduler (kube-scheduler)
* Controller Manager (kube-controller-manager)
* etcd (armazenamento de estado)
* Cloud Controller Manager (integração AWS)

**Data Plane (gerenciado por você)**:
* Worker nodes (EC2, Fargate, ou híbridos)
* Pods e containers
* Kubelet e kube-proxy
* Container runtime (containerd)
* Add-ons e plugins

### Como funciona o Control Plane

O control plane do EKS roda em uma VPC gerenciada pela AWS, completamente isolada da sua conta:

```
┌─────────────────────────────────────────────────┐
│         AWS Managed VPC (invisível)             │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │     EKS Control Plane (Multi-AZ)         │  │
│  │                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐│  │
│  │  │ API      │  │Scheduler │  │ etcd   ││  │
│  │  │ Server   │  │          │  │        ││  │
│  │  │ (HA)     │  │          │  │ (HA)   ││  │
│  │  └──────────┘  └──────────┘  └────────┘│  │
│  │                                          │  │
│  │  ┌──────────┐  ┌──────────────────────┐│  │
│  │  │Controller│  │ Cloud Controller     ││  │
│  │  │ Manager  │  │ Manager (AWS)        ││  │
│  │  └──────────┘  └──────────────────────┘│  │
│  └──────────────────────────────────────────┘  │
│                      │                          │
└──────────────────────┼──────────────────────────┘
                       │ ENI Cross-Account
                       │
┌──────────────────────▼──────────────────────────┐
│              Sua VPC                             │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Worker Nodes (Data Plane)          │ │
│  │                                            │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │ │
│  │  │ Node │  │ Node │  │ Node │  │ Node │ │ │
│  │  │  1   │  │  2   │  │  3   │  │  4   │ │ │
│  │  └──────┘  └──────┘  └──────┘  └──────┘ │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Características do Control Plane**:

* **Multi-AZ por padrão**: Distribuído em pelo menos 2 AZs
* **Altamente disponível**: SLA de 99.95%
* **Versionado**: Você escolhe a versão do Kubernetes
* **Atualizado pela AWS**: Patches de segurança automáticos
* **Isolado**: Não consome recursos da sua conta


### Comunicação Control Plane ↔ Data Plane

A comunicação acontece através de ENIs (Elastic Network Interfaces) criadas na sua VPC:

1. **Cluster Endpoint**: URL pública ou privada para acessar o API Server
2. **ENIs Cross-Account**: Interfaces de rede que conectam o control plane aos nodes
3. **Security Groups**: Controlam o tráfego entre control plane e nodes

**Modos de acesso ao cluster**:

* **Public**: API Server acessível pela internet (com controle de IPs)
* **Private**: API Server acessível apenas de dentro da VPC
* **Public and Private**: Ambos habilitados (recomendado)

```bash
# Ver configuração de endpoint
aws eks describe-cluster --name meu-cluster \
  --query 'cluster.resourcesVpcConfig'

# Resultado:
{
  "subnetIds": ["subnet-abc", "subnet-def"],
  "securityGroupIds": ["sg-123"],
  "clusterSecurityGroupId": "sg-456",
  "vpcId": "vpc-789",
  "endpointPublicAccess": true,
  "endpointPrivateAccess": true,
  "publicAccessCidrs": ["0.0.0.0/0"]
}
```

## Tipos de Nodes

O EKS suporta três tipos de nodes, cada um com características específicas:

### 1. Managed Node Groups (EC2)

**O que é**: Grupos de instâncias EC2 gerenciados pelo EKS.

**Como funciona**:
* EKS cria e gerencia Auto Scaling Groups
* Nodes são automaticamente registrados no cluster
* Atualizações podem ser automatizadas
* Integração nativa com AWS Systems Manager

**Quando usar**:
* Workloads stateful (bancos de dados, caches)
* Aplicações que precisam de GPU
* Controle sobre tipo de instância
* Necessidade de acesso SSH aos nodes

**Limitações**:
* Você paga pelas instâncias EC2 (mesmo ociosas)
* Precisa gerenciar capacidade
* Startup time de ~2-3 minutos

**Criando via CLI**:

```bash
aws eks create-nodegroup \
  --cluster-name meu-cluster \
  --nodegroup-name workers \
  --subnets subnet-abc subnet-def \
  --instance-types t3.medium \
  --scaling-config minSize=2,maxSize=10,desiredSize=3 \
  --disk-size 20 \
  --node-role arn:aws:iam::123456789012:role/EKSNodeRole
```


### 2. AWS Fargate

**O que é**: Serverless compute para Kubernetes. Você não gerencia nodes.

**Como funciona**:
* Cada pod roda em uma micro-VM isolada
* Recursos alocados sob demanda
* Cobrança por vCPU e memória consumidos
* Sem acesso ao node subjacente

**Quando usar**:
* Workloads stateless (APIs, workers)
* Ambientes de desenvolvimento/staging
* Cargas de trabalho com padrões previsíveis
* Quando você quer zero gerenciamento de nodes

**Limitações**:
* Não suporta DaemonSets
* Não suporta privileged containers
* Não suporta GPU
* Startup time de ~30-60 segundos
* Custo pode ser maior para workloads 24/7

**Configurando Fargate Profile**:

```bash
aws eks create-fargate-profile \
  --cluster-name meu-cluster \
  --fargate-profile-name app-profile \
  --pod-execution-role-arn arn:aws:iam::123456789012:role/FargatePodRole \
  --subnets subnet-abc subnet-def \
  --selectors namespace=production,labels={app=api}
```

**Como funciona o scheduling**:

```yaml
# Este pod será agendado no Fargate
apiVersion: v1
kind: Pod
metadata:
  name: api-pod
  namespace: production
  labels:
    app: api
spec:
  containers:
  - name: app
    image: myapp:latest
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
```

### 3. Self-Managed Nodes

**O que é**: Instâncias EC2 que você cria e registra manualmente no cluster.

**Como funciona**:
* Você cria as instâncias EC2
* Instala kubelet e registra no cluster
* Controle total sobre configuração

**Quando usar**:
* Requisitos muito específicos de OS
* Instâncias spot com lógica customizada
* Integração com ferramentas próprias
* Ambientes híbridos (on-premises)

**Limitações**:
* Mais trabalho operacional
* Você gerencia tudo (AMI, patches, updates)
* Sem integração automática com EKS


## Plugins essenciais do EKS

O EKS vem com três add-ons críticos que fazem o cluster funcionar:

### 1. Amazon VPC CNI

**O que faz**: Gerencia a rede dos pods, atribuindo IPs da VPC diretamente aos pods.

**Como funciona**:

```
┌─────────────────────────────────────────┐
│           VPC (10.0.0.0/16)             │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  Subnet (10.0.1.0/24)              │ │
│  │                                    │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │  EC2 Node (10.0.1.10)        │ │ │
│  │  │                              │ │ │
│  │  │  Primary ENI: 10.0.1.10      │ │ │
│  │  │                              │ │ │
│  │  │  Secondary IPs:              │ │ │
│  │  │  ├─ Pod 1: 10.0.1.20         │ │ │
│  │  │  ├─ Pod 2: 10.0.1.21         │ │ │
│  │  │  └─ Pod 3: 10.0.1.22         │ │ │
│  │  └──────────────────────────────┘ │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Características**:
* Pods recebem IPs reais da VPC
* Comunicação direta entre pods sem NAT
* Integração nativa com Security Groups
* Suporta Network Policies

**Limitações importantes**:
* Número de pods por node limitado por ENIs e IPs secundários
* Consome IPs da sua VPC rapidamente
* Planeje bem o CIDR da VPC

**Exemplo de limites**:

| Tipo de Instância | ENIs | IPs por ENI | Pods máximos |
|-------------------|------|-------------|--------------|
| t3.small | 3 | 4 | 11 |
| t3.medium | 3 | 6 | 17 |
| t3.large | 3 | 12 | 35 |
| m5.large | 3 | 10 | 29 |
| m5.xlarge | 4 | 15 | 58 |

**Configurações importantes**:

```bash
# Ver configuração do CNI
kubectl get daemonset aws-node -n kube-system -o yaml

# Variáveis de ambiente importantes:
# ENABLE_PREFIX_DELEGATION: Aumenta pods por node
# WARM_IP_TARGET: IPs pré-alocados
# MINIMUM_IP_TARGET: Mínimo de IPs disponíveis
```

### 2. CoreDNS

**O que faz**: Resolve nomes DNS dentro do cluster.

**Como funciona**:
* Deployment com 2 réplicas por padrão
* Resolve `service.namespace.svc.cluster.local`
* Cache de resoluções DNS
* Integração com Route 53 para DNS externo

**Exemplo de resolução**:

```bash
# Dentro de um pod
nslookup api-service.production.svc.cluster.local

# Resultado:
Server:    10.100.0.10
Address:   10.100.0.10:53

Name:      api-service.production.svc.cluster.local
Address:   10.100.45.123
```

**Configuração**:

```bash
# Ver configuração do CoreDNS
kubectl get configmap coredns -n kube-system -o yaml

# Escalar CoreDNS
kubectl scale deployment coredns -n kube-system --replicas=3
```


### 3. kube-proxy

**O que faz**: Gerencia regras de rede para Services.

**Como funciona**:
* DaemonSet rodando em cada node
* Cria regras iptables/ipvs para roteamento
* Implementa load balancing entre pods

**Modos de operação**:

* **iptables** (padrão): Usa iptables para roteamento
* **ipvs**: Mais performático para muitos services

```bash
# Ver modo do kube-proxy
kubectl get configmap kube-proxy-config -n kube-system -o yaml

# Trocar para ipvs
kubectl edit configmap kube-proxy-config -n kube-system
# Alterar mode: "ipvs"

# Reiniciar kube-proxy
kubectl rollout restart daemonset kube-proxy -n kube-system
```

## Autenticação e Autorização

O EKS oferece dois modelos para gerenciar acesso ao cluster:

### Modelo Legado: aws-auth ConfigMap

**Como funciona**:

O ConfigMap `aws-auth` mapeia IAM roles/users para grupos do Kubernetes:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-auth
  namespace: kube-system
data:
  mapRoles: |
    - rolearn: arn:aws:iam::123456789012:role/EKSNodeRole
      username: system:node:{{EC2PrivateDNSName}}
      groups:
        - system:bootstrappers
        - system:nodes
    - rolearn: arn:aws:iam::123456789012:role/DevTeamRole
      username: dev-user
      groups:
        - developers
  mapUsers: |
    - userarn: arn:aws:iam::123456789012:user/admin
      username: admin
      groups:
        - system:masters
```

**Problemas do aws-auth**:

❌ ConfigMap pode ser sobrescrito acidentalmente
❌ Difícil de auditar mudanças
❌ Não suporta versionamento
❌ Requer acesso ao cluster para modificar
❌ Não integra com CloudTrail

### Modelo Novo: Access Entries (EKS Access API)

**Como funciona**:

Access Entries são gerenciados via API da AWS, fora do cluster:

```bash
# Criar access entry
aws eks create-access-entry \
  --cluster-name meu-cluster \
  --principal-arn arn:aws:iam::123456789012:role/DevTeamRole \
  --type STANDARD

# Associar policy
aws eks associate-access-policy \
  --cluster-name meu-cluster \
  --principal-arn arn:aws:iam::123456789012:role/DevTeamRole \
  --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy \
  --access-scope type=cluster
```

**Políticas disponíveis**:

| Policy | Permissões | Uso |
|--------|-----------|-----|
| AmazonEKSClusterAdminPolicy | Acesso total | Administradores |
| AmazonEKSAdminPolicy | Admin sem cluster-scoped | Admins de namespace |
| AmazonEKSEditPolicy | Criar/modificar recursos | Desenvolvedores |
| AmazonEKSViewPolicy | Somente leitura | Auditores |

**Vantagens do Access Entries**:

* Gerenciado via AWS API (CloudTrail audit)
* Versionamento automático
* Não requer acesso ao cluster
* Suporta namespaces específicos
* Integração com IAM Identity Center


**Migração de aws-auth para Access Entries**:

```bash
# 1. Listar entradas atuais do aws-auth
kubectl get configmap aws-auth -n kube-system -o yaml

# 2. Criar access entries equivalentes
aws eks create-access-entry \
  --cluster-name meu-cluster \
  --principal-arn arn:aws:iam::123456789012:role/DevTeamRole

# 3. Testar acesso
aws eks update-kubeconfig --name meu-cluster --role-arn arn:aws:iam::123456789012:role/DevTeamRole
kubectl get pods

# 4. Remover do aws-auth após validar
kubectl edit configmap aws-auth -n kube-system
```

## Pod Identity: Acesso a serviços AWS

Pods frequentemente precisam acessar serviços AWS (S3, DynamoDB, SQS). Existem três formas de fazer isso:

### 1. IRSA (IAM Roles for Service Accounts) - Legado

**Como funciona**:

```
┌──────────────────────────────────────────┐
│           Pod                            │
│                                          │
│  ServiceAccount: app-sa                  │
│  Annotation: eks.amazonaws.com/role-arn  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Container                         │ │
│  │                                    │ │
│  │  AWS SDK detecta token JWT        │ │
│  │  ↓                                 │ │
│  │  Assume IAM Role via OIDC         │ │
│  │  ↓                                 │ │
│  │  Recebe credenciais temporárias   │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Configuração**:

```yaml
# ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: production
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/AppRole

---
# Pod usando o ServiceAccount
apiVersion: v1
kind: Pod
metadata:
  name: app
  namespace: production
spec:
  serviceAccountName: app-sa
  containers:
  - name: app
    image: myapp:latest
    # AWS SDK automaticamente usa as credenciais
```

**IAM Role Trust Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::123456789012:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/EXAMPLED539D4633E53DE1B71EXAMPLE"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "oidc.eks.us-east-1.amazonaws.com/id/EXAMPLED539D4633E53DE1B71EXAMPLE:sub": "system:serviceaccount:production:app-sa"
      }
    }
  }]
}
```


### 2. EKS Pod Identity - Novo e Recomendado

**Como funciona**:

Pod Identity simplifica o processo, removendo a necessidade de OIDC provider e trust policies complexas:

```bash
# 1. Criar associação de Pod Identity
aws eks create-pod-identity-association \
  --cluster-name meu-cluster \
  --namespace production \
  --service-account app-sa \
  --role-arn arn:aws:iam::123456789012:role/AppRole
```

**Vantagens sobre IRSA**:

*  Não precisa configurar OIDC provider
*  Trust policy mais simples
*  Gerenciado via AWS API (auditável)
*  Suporta múltiplos clusters facilmente
*  Melhor performance (menos chamadas STS)

**Trust Policy simplificada**:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "pods.eks.amazonaws.com"
    },
    "Action": [
      "sts:AssumeRole",
      "sts:TagSession"
    ]
  }]
}
```

**Uso no pod** (idêntico ao IRSA):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
  namespace: production
spec:
  serviceAccountName: app-sa
  containers:
  - name: app
    image: myapp:latest
    # AWS SDK automaticamente usa Pod Identity
```

### 3. Node IAM Role - Não Recomendado

**Como funciona**: Todos os pods no node herdam as permissões do node.

❌ **Problemas**:
* Sem isolamento entre pods
* Princípio do menor privilégio violado
* Difícil de auditar quem acessou o quê
* Risco de segurança

**Quando usar**: Apenas para add-ons do sistema (aws-node, ebs-csi-driver).

## Rede no EKS: Como pods se comunicam

### Comunicação Pod-to-Pod

Com o VPC CNI, pods se comunicam diretamente usando IPs da VPC:

```
Pod A (10.0.1.20) → Pod B (10.0.2.30)
     ↓
  Roteamento direto via VPC
     ↓
  Sem NAT, sem overlay
```

**Vantagens**:
* Performance nativa (sem overhead)
* Compatível com Security Groups
* Troubleshooting mais simples (IPs reais)

**Desvantagens**:
* Consome muitos IPs da VPC
* Planejamento de CIDR crítico

### Comunicação via Services

Services criam um IP virtual (ClusterIP) que load-balanceia entre pods:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

**Como funciona**:

```
Client Pod → api-service (10.100.45.123:80)
                ↓
          kube-proxy (iptables)
                ↓
        Load balance entre:
        ├─ Pod 1 (10.0.1.20:8080)
        ├─ Pod 2 (10.0.1.21:8080)
        └─ Pod 3 (10.0.2.30:8080)
```


### Tipos de Services

**ClusterIP** (padrão):
* Acessível apenas dentro do cluster
* Ideal para comunicação interna

**NodePort**:
* Expõe porta em todos os nodes
* Acessível via `<NodeIP>:<NodePort>`
* Raramente usado em produção

**LoadBalancer**:
* Cria um AWS Load Balancer (NLB ou CLB)
* Expõe serviço para internet ou VPC
* Custo adicional por LB

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-public
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
spec:
  type: LoadBalancer
  selector:
    app: api
  ports:
  - port: 443
    targetPort: 8080
```

### Ingress com AWS Load Balancer Controller

Para gerenciar múltiplos serviços com um único Load Balancer:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 80
```

**Como funciona**:

```
Internet
   ↓
Application Load Balancer
   ↓
┌──────────────────────────────┐
│ Target Group 1 (api)         │ → api-service pods
│ Target Group 2 (admin)       │ → admin-service pods
└──────────────────────────────┘
```

## Observabilidade e Logging

### Control Plane Logs

O EKS pode enviar logs do control plane para CloudWatch. Isso é essencial para auditoria, troubleshooting e compliance.

```bash
# Habilitar todos os tipos de logs
aws eks update-cluster-config \
  --name meu-cluster \
  --logging '{"clusterLogging":[{"types":["api","audit","authenticator","controllerManager","scheduler"],"enabled":true}]}'
```

**Tipos de logs e quando usar**:

| Tipo | O que registra | Quando habilitar | Custo |
|------|---------------|------------------|-------|
| **audit** | Todas as ações no cluster | Sempre (compliance) | Alto |
| **authenticator** | Tentativas de autenticação | Sempre (segurança) | Baixo |
| **api** | Requisições ao API Server | Troubleshooting | Médio |
| **controllerManager** | Ações dos controllers | Debug avançado | Baixo |
| **scheduler** | Decisões de scheduling | Debug de pods pending | Baixo |

**Recomendação**: Habilite pelo menos `audit` e `authenticator` em produção.

### Audit Logs: O que você precisa saber

Audit logs registram TODAS as ações no cluster. Cada linha é um evento no formato JSON.

**Estrutura de um audit log**:

```json
{
  "kind": "Event",
  "apiVersion": "audit.k8s.io/v1",
  "level": "Metadata",
  "auditID": "abc-123-def",
  "stage": "ResponseComplete",
  "requestURI": "/api/v1/namespaces/production/pods",
  "verb": "create",
  "user": {
    "username": "alice@company.com",
    "uid": "aws-iam-authenticator:123456789012:AIDAI...",
    "groups": ["system:authenticated"]
  },
  "sourceIPs": ["203.0.113.45"],
  "userAgent": "kubectl/v1.28.0",
  "objectRef": {
    "resource": "pods",
    "namespace": "production",
    "name": "api-pod",
    "apiVersion": "v1"
  },
  "responseStatus": {
    "code": 201
  },
  "requestReceivedTimestamp": "2026-03-27T10:30:00.123456Z",
  "stageTimestamp": "2026-03-27T10:30:00.234567Z"
}
```

**Campos importantes**:

* `verb`: Ação realizada (get, list, create, update, delete, patch)
* `user.username`: Quem fez a ação
* `objectRef`: Qual recurso foi afetado
* `responseStatus.code`: Sucesso (2xx) ou erro (4xx, 5xx)
* `sourceIPs`: De onde veio a requisição

### CloudWatch Insights: Queries práticas

#### 1. Quem deletou um recurso?

```
fields @timestamp, user.username, objectRef.namespace, objectRef.name, sourceIPs.0
| filter verb = "delete"
| filter objectRef.resource = "pods"
| sort @timestamp desc
| limit 50
```

#### 2. Tentativas de acesso negadas (403)

```
fields @timestamp, user.username, verb, objectRef.resource, objectRef.namespace, responseStatus.code
| filter responseStatus.code = 403
| stats count() by user.username, verb, objectRef.resource
| sort count desc
```

#### 3. Quem criou secrets recentemente?

```
fields @timestamp, user.username, objectRef.namespace, objectRef.name
| filter verb = "create"
| filter objectRef.resource = "secrets"
| filter @timestamp > ago(7d)
| sort @timestamp desc
```

#### 4. Mudanças em recursos críticos (deployments, services)

```
fields @timestamp, user.username, verb, objectRef.resource, objectRef.namespace, objectRef.name
| filter verb in ["create", "update", "delete", "patch"]
| filter objectRef.resource in ["deployments", "services", "ingresses"]
| filter objectRef.namespace = "production"
| sort @timestamp desc
| limit 100
```

#### 5. Atividade de um usuário específico

```
fields @timestamp, verb, objectRef.resource, objectRef.namespace, objectRef.name, responseStatus.code
| filter user.username = "alice@company.com"
| filter @timestamp > ago(24h)
| sort @timestamp desc
```

#### 6. Pods que falharam ao criar

```
fields @timestamp, user.username, objectRef.namespace, objectRef.name, responseStatus.message
| filter verb = "create"
| filter objectRef.resource = "pods"
| filter responseStatus.code >= 400
| sort @timestamp desc
```

#### 7. Exec em pods (acesso shell)

```
fields @timestamp, user.username, objectRef.namespace, objectRef.name, sourceIPs.0
| filter verb = "create"
| filter objectRef.subresource = "exec"
| sort @timestamp desc
```

#### 8. Mudanças em RBAC (roles, rolebindings)

```
fields @timestamp, user.username, verb, objectRef.resource, objectRef.namespace, objectRef.name
| filter objectRef.resource in ["roles", "rolebindings", "clusterroles", "clusterrolebindings"]
| filter verb in ["create", "update", "delete", "patch"]
| sort @timestamp desc
```

#### 9. Atividade por namespace

```
fields @timestamp, verb, objectRef.resource, objectRef.name
| filter objectRef.namespace = "production"
| filter verb in ["create", "delete"]
| stats count() by verb, objectRef.resource
| sort count desc
```

#### 10. Erros de autenticação

```
fields @timestamp, user.username, sourceIPs.0, responseStatus.message
| filter responseStatus.code = 401
| stats count() by user.username, sourceIPs.0
| sort count desc
```

#### 11. Recursos criados fora do horário comercial

```
fields @timestamp, user.username, verb, objectRef.resource, objectRef.namespace, objectRef.name
| filter verb = "create"
| filter datefloor(@timestamp, 1h) < datefloor(now() - 12h, 1h) or datefloor(@timestamp, 1h) > datefloor(now() - 8h, 1h)
| sort @timestamp desc
```

#### 12. Top usuários mais ativos

```
fields user.username, verb
| filter verb in ["create", "update", "delete", "patch"]
| stats count() as actions by user.username
| sort actions desc
| limit 10
```

### Configurando alertas baseados em audit logs

**Alerta: Deleção de recursos em produção**

```bash
# Criar métrica customizada
aws logs put-metric-filter \
  --log-group-name /aws/eks/meu-cluster/cluster \
  --filter-name ProductionDeletions \
  --filter-pattern '{ $.verb = "delete" && $.objectRef.namespace = "production" }' \
  --metric-transformations \
    metricName=ProductionDeletions,\
    metricNamespace=EKS/Audit,\
    metricValue=1

# Criar alarme
aws cloudwatch put-metric-alarm \
  --alarm-name eks-production-deletions \
  --alarm-description "Alert on deletions in production namespace" \
  --metric-name ProductionDeletions \
  --namespace EKS/Audit \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:security-alerts
```

**Alerta: Tentativas de acesso negadas**

```bash
aws logs put-metric-filter \
  --log-group-name /aws/eks/meu-cluster/cluster \
  --filter-name AccessDenied \
  --filter-pattern '{ $.responseStatus.code = 403 }' \
  --metric-transformations \
    metricName=AccessDenied,\
    metricNamespace=EKS/Audit,\
    metricValue=1

aws cloudwatch put-metric-alarm \
  --alarm-name eks-access-denied-spike \
  --metric-name AccessDenied \
  --namespace EKS/Audit \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:security-alerts
```

### Retenção e custos de logs

**Custos típicos**:

```
Cluster pequeno (10 nodes):
- Audit logs: ~5 GB/dia = $2.50/dia = $75/mês
- API logs: ~2 GB/dia = $1/dia = $30/mês
- Authenticator: ~100 MB/dia = $0.05/dia = $1.50/mês

Cluster médio (50 nodes):
- Audit logs: ~25 GB/dia = $12.50/dia = $375/mês
- API logs: ~10 GB/dia = $5/dia = $150/mês
```

**Recomendações de retenção**:

```bash
# Audit logs: 90 dias (compliance)
aws logs put-retention-policy \
  --log-group-name /aws/eks/meu-cluster/cluster \
  --retention-in-days 90

# API logs: 30 dias (troubleshooting)
aws logs put-retention-policy \
  --log-group-name /aws/eks/meu-cluster/cluster \
  --retention-in-days 30

# Authenticator: 30 dias
aws logs put-retention-policy \
  --log-group-name /aws/eks/meu-cluster/cluster \
  --retention-in-days 30
```

**Otimização de custos**:

1. **Exporte para S3** após 7 dias (muito mais barato)
2. **Use S3 Intelligent-Tiering** para arquivamento
3. **Habilite apenas logs necessários** em dev/staging
4. **Use filtros** para reduzir volume (ex: ignore health checks)



### Application Logs

Para logs de aplicação, use Fluent Bit ou CloudWatch Container Insights:

**Fluent Bit** (recomendado):

```bash
# Instalar via Helm
helm repo add eks https://aws.github.io/eks-charts
helm install aws-for-fluent-bit eks/aws-for-fluent-bit \
  --namespace kube-system \
  --set cloudWatch.region=us-east-1 \
  --set cloudWatch.logGroupName=/aws/eks/meu-cluster/application
```

**Container Insights**:

```bash
# Instalar CloudWatch agent
kubectl apply -f https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/quickstart/cwagent-fluentd-quickstart.yaml
```

### Métricas

**Metrics Server** (obrigatório para HPA):

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verificar
kubectl top nodes
kubectl top pods -A
```

**Prometheus + Grafana**:

```bash
# Instalar kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

## Evoluções do EKS: Karpenter e Auto Mode

### Karpenter: Autoscaling inteligente

**O que é**: Autoscaler de nodes mais eficiente que o Cluster Autoscaler.

**Diferenças do Cluster Autoscaler**:

| Cluster Autoscaler | Karpenter |
|-------------------|-----------|
| Baseado em node groups | Provisiona nodes individuais |
| Reativo (espera pending pods) | Proativo (antecipa necessidades) |
| Limitado a tipos pré-definidos | Escolhe melhor tipo automaticamente |
| Escala em grupos | Escala granularmente |
| Lento (~5 min) | Rápido (~2 min) |

**Como funciona**:

```
Pending Pod
    ↓
Karpenter analisa:
- CPU/Memory requests
- Node selectors
- Taints/Tolerations
- Topology constraints
    ↓
Escolhe melhor instância:
- Spot vs On-Demand
- Tipo de instância
- AZ
    ↓
Provisiona em ~2 minutos
```

**Exemplo de NodePool**:

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default
spec:
  template:
    spec:
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot", "on-demand"]
      - key: kubernetes.io/arch
        operator: In
        values: ["amd64"]
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c", "m", "r"]
  limits:
    cpu: 1000
    memory: 1000Gi
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 720h
```

**Benefícios**:
* Redução de custos (30-50% com spot)
* Melhor bin-packing
* Consolidação automática
* Menos desperdício de recursos


### EKS Auto Mode: O futuro do EKS

**O que é**: Modo totalmente gerenciado onde a AWS cuida de tudo.

**Lançado em**: re:Invent 2024

**O que a AWS gerencia no Auto Mode**:

*  Compute (nodes)
*  Networking (VPC CNI)
*  Storage (EBS CSI Driver)
*  Load balancing
*  Autoscaling (Karpenter integrado)
*  Atualizações de nodes
*  Patches de segurança

**Você só gerencia**:
* Seus workloads (pods, deployments)
* Configurações de aplicação
* Políticas de acesso

**Como funciona**:

```
Você:
  kubectl apply -f deployment.yaml
     ↓
EKS Auto Mode:
  ├─ Analisa recursos necessários
  ├─ Provisiona nodes automaticamente
  ├─ Configura networking
  ├─ Gerencia storage
  └─ Escala conforme necessário
```

**Diferenças dos modos tradicionais**:

| Aspecto | Tradicional | Auto Mode |
|---------|-------------|-----------|
| Node management | Você | AWS |
| Autoscaling | Você configura | Automático |
| Add-ons | Você instala | Pré-instalados |
| Atualizações | Você agenda | Automáticas |
| Networking | Você configura | Gerenciado |
| Custo | Pay per node | Pay per pod |

**Quando usar Auto Mode**:

*  Novos clusters
*  Equipes pequenas
*  Foco em aplicação, não infra
*  Ambientes de desenvolvimento
*  Startups

**Quando NÃO usar Auto Mode**:

❌ Requisitos muito específicos de nodes
❌ Necessidade de controle total
❌ Workloads com GPU (ainda não suportado)
❌ Integração com ferramentas próprias de node management

**Habilitando Auto Mode**:

```bash
# Criar cluster com Auto Mode
aws eks create-cluster \
  --name meu-cluster-auto \
  --role-arn arn:aws:iam::123456789012:role/EKSClusterRole \
  --resources-vpc-config subnetIds=subnet-abc,subnet-def \
  --compute-config enabled=true,nodeRoleArn=arn:aws:iam::123456789012:role/EKSNodeRole
```

**Modelo de cobrança**:

```
Tradicional:
- Control plane: $0.10/hora
- Nodes: Preço da instância EC2

Auto Mode:
- Control plane: $0.10/hora
- Compute: $0.10/vCPU/hora + $0.01/GB/hora
- Cobrança por pod, não por node
```


## Primeiros passos práticos

### 1. Criando seu primeiro cluster

```bash
# Instalar eksctl (ferramenta CLI para EKS)
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Criar cluster básico
eksctl create cluster \
  --name meu-primeiro-cluster \
  --region us-east-1 \
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# Aguardar ~15-20 minutos
```

### 2. Configurando kubectl

```bash
# Atualizar kubeconfig
aws eks update-kubeconfig --name meu-primeiro-cluster --region us-east-1

# Verificar conexão
kubectl get nodes
kubectl get pods -A
```

### 3. Deploy de primeira aplicação

```yaml
# app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
---
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
```

```bash
# Aplicar
kubectl apply -f app.yaml

# Verificar
kubectl get deployments
kubectl get pods
kubectl get services

# Obter URL do LoadBalancer
kubectl get service nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### 4. Instalando add-ons essenciais

**AWS Load Balancer Controller**:

```bash
# Criar IAM policy
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# Instalar via Helm
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=meu-primeiro-cluster \
  --set serviceAccount.create=true \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=arn:aws:iam::ACCOUNT_ID:role/AmazonEKSLoadBalancerControllerRole
```

**EBS CSI Driver** (para volumes persistentes):

```bash
# Habilitar add-on
aws eks create-addon \
  --cluster-name meu-primeiro-cluster \
  --addon-name aws-ebs-csi-driver \
  --service-account-role-arn arn:aws:iam::ACCOUNT_ID:role/AmazonEKS_EBS_CSI_DriverRole
```

**Metrics Server**:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```


## Decisões arquiteturais importantes

### 1. Planejamento de VPC e CIDR

**Erro comum**: CIDR muito pequeno

```
Errado:
VPC: 10.0.0.0/24 (256 IPs)
- Subnets: 10.0.0.0/26 (64 IPs cada)
- Resultado: ~10 pods por subnet

Correto:
VPC: 10.0.0.0/16 (65,536 IPs)
- Subnets: 10.0.0.0/20 (4,096 IPs cada)
- Resultado: Centenas de pods por subnet
```

**Recomendação**:
* VPC: /16 (65k IPs)
* Subnets públicas: /20 (4k IPs)
* Subnets privadas: /19 (8k IPs)
* Reserve espaço para crescimento

### 2. Escolha de tipos de nodes

**Workloads stateless** → Fargate ou Spot instances
**Workloads stateful** → On-Demand instances
**Workloads batch** → Spot instances com Karpenter
**Workloads GPU** → Instâncias p3/g4

### 3. Multi-AZ vs Single-AZ

**Production** → Sempre Multi-AZ:
* Control plane já é Multi-AZ
* Distribua nodes em pelo menos 2 AZs
* Use topology spread constraints

```yaml
spec:
  topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: critical-app
```

**Development/Staging** → Single-AZ pode ser aceitável

### 4. Endpoint privado: Boa prática de segurança

**Boa prática**: Em ambientes de produção, o acesso ao API Server do EKS deve ser feito preferencialmente através de endpoint privado, com acesso via VPN ou AWS Direct Connect.

O EKS permite configurar como o API Server do Kubernetes será acessado. Existem três modos:

#### Modo 1: Apenas Privado (Private Only) RECOMENDADO PARA PRODUÇÃO

**Como funciona**:
* API Server acessível apenas de dentro da VPC
* Acesso externo via VPN, AWS Direct Connect ou bastion host
* Nodes acessam via rede privada
* Zero exposição à internet

```
VPN/Direct Connect
        ↓
      VPC
       ├─ API Server (privado)
       └─ Nodes (via rede privada)
```

**Por que é a melhor prática**:

**Segurança máxima**: API Server nunca exposto à internet
**Compliance**: Atende requisitos rigorosos de segurança
**Menor superfície de ataque**: Sem endpoint público
**Auditoria simplificada**: Todo acesso rastreável via VPN
**Performance**: Latência menor para nodes
**Isolamento**: Tráfego nunca sai da rede privada

**Quando usar**:
* Ambientes de produção (sempre)
* Clusters com dados sensíveis
* Requisitos de compliance (PCI-DSS, HIPAA, SOC2)
* Empresas com VPN corporativa estabelecida

**Configuração**:

```bash
# Habilitar apenas endpoint privado
aws eks update-cluster-config \
  --name meu-cluster-prod \
  --resources-vpc-config \
    endpointPublicAccess=false,\
    endpointPrivateAccess=true
```

**Acesso via VPN**:

```bash
# 1. Conectar à VPN corporativa
# 2. Configurar kubectl
aws eks update-kubeconfig --name meu-cluster-prod --region us-east-1

# 3. Verificar acesso
kubectl get nodes

# O tráfego flui:
# Seu laptop → VPN → VPC → API Server (privado)
```

**Acesso via AWS Client VPN**:

Para configurar o AWS Client VPN Endpoint, veja o [guia completo sobre AWS VPN Client Endpoint](https://thiagoalexandria.com.br/utilizando-o-aws-vpn-client-endpoint/) que cobre desde a criação dos certificados até a configuração do cliente.

Resumo da configuração:

```bash
# Criar Client VPN Endpoint
aws ec2 create-client-vpn-endpoint \
  --client-cidr-block 10.100.0.0/22 \
  --server-certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/abc123 \
  --authentication-options Type=certificate-authentication,MutualAuthentication={ClientRootCertificateChainArn=arn:aws:acm:us-east-1:123456789012:certificate/def456} \
  --connection-log-options Enabled=true,CloudwatchLogGroup=/aws/vpn/client \
  --vpc-id vpc-abc123

# Associar com subnet
aws ec2 associate-client-vpn-target-network \
  --client-vpn-endpoint-id cvpn-endpoint-abc123 \
  --subnet-id subnet-def456

# Autorizar acesso
aws ec2 authorize-client-vpn-ingress \
  --client-vpn-endpoint-id cvpn-endpoint-abc123 \
  --target-network-cidr 10.0.0.0/16 \
  --authorize-all-groups
```

**Acesso via bastion host** (alternativa):

```bash
# 1. SSH para bastion na VPC
ssh -i key.pem ec2-user@bastion.example.com

# 2. Dentro do bastion, usar kubectl
kubectl get nodes
```

#### Modo 2: Público e Privado (Public and Private)

**Como funciona**:
* API Server tem endpoint público E privado
* Nodes usam endpoint privado automaticamente
* Acesso externo via endpoint público (com restrições de IP)

```
Internet (IPs restritos)    VPC
         ↓                   ↓
    API Server ←────────→ Nodes
    (público)            (via privado)
```

**Quando usar**:
* Ambientes de staging/desenvolvimento
* Transição para modelo totalmente privado
* Equipes distribuídas sem VPN estabelecida
* CI/CD rodando fora da VPC

**Configuração com restrição de IPs**:

```bash
# Habilitar ambos, mas restringir público
aws eks update-cluster-config \
  --name meu-cluster-staging \
  --resources-vpc-config \
    endpointPublicAccess=true,\
    endpointPrivateAccess=true,\
    publicAccessCidrs="203.0.113.0/24,198.51.100.0/24"

# Apenas IPs do escritório e CI/CD podem acessar
```

**Importante**: Mesmo com endpoint público, os nodes SEMPRE usam o endpoint privado quando disponível.

#### Modo 3: Apenas Público (Public Only) NÃO RECOMENDADO

**Como funciona**:
* API Server exposto à internet
* Nodes acessam pela internet

**Quando usar**:
* Apenas para testes rápidos
* Ambientes de desenvolvimento pessoal
* Nunca em produção

**Problemas**:
❌ API Server exposto à internet
❌ Nodes precisam de internet para falar com control plane
❌ Maior latência
❌ Maior superfície de ataque
❌ Não atende compliance

#### Migração para endpoint privado

**Passo a passo para migrar produção**:

```bash
# 1. Verificar configuração atual
aws eks describe-cluster --name meu-cluster \
  --query 'cluster.resourcesVpcConfig'

# 2. Habilitar endpoint privado (mantém público temporariamente)
aws eks update-cluster-config \
  --name meu-cluster \
  --resources-vpc-config \
    endpointPublicAccess=true,\
    endpointPrivateAccess=true

# 3. Aguardar propagação (~10 minutos)
aws eks wait cluster-active --name meu-cluster

# 4. Configurar VPN/Direct Connect
# (configuração específica da sua infraestrutura)

# 5. Testar acesso via VPN
# Conectar VPN e executar:
kubectl get nodes

# 6. Validar que nodes usam endpoint privado
kubectl get nodes -o wide
# Verificar que IPs são privados

# 7. Desabilitar endpoint público
aws eks update-cluster-config \
  --name meu-cluster \
  --resources-vpc-config \
    endpointPublicAccess=false,\
    endpointPrivateAccess=true

# 8. Validar acesso
# Sem VPN: deve falhar
# Com VPN: deve funcionar
```

#### Exemplo prático: Acesso via AWS Client VPN

Para um guia completo sobre como configurar o AWS Client VPN Endpoint do zero, incluindo geração de certificados, configuração de autenticação e troubleshooting, consulte o artigo [Utilizando o AWS VPN Client Endpoint](https://thiagoalexandria.com.br/utilizando-o-aws-vpn-client-endpoint/).

Fluxo de uso após configuração:

```bash
# 1. Baixar configuração do Client VPN
aws ec2 export-client-vpn-client-configuration \
  --client-vpn-endpoint-id cvpn-endpoint-abc123 \
  --output text > eks-vpn.ovpn

# 2. Importar no cliente OpenVPN
# (AWS VPN Client, Tunnelblick, OpenVPN Connect)

# 3. Conectar à VPN

# 4. Usar kubectl normalmente
kubectl get pods -A
kubectl logs -f deployment/app

# 5. Desconectar quando terminar
```

### 5. Versão do Kubernetes

**Regra**: Sempre use N-1 ou N-2 (nunca a mais recente)

```
Atual: 1.35
Recomendado: 1.34 ou 1.33
```

**Ciclo de suporte EKS**:
* Cada versão suportada por ~14 meses
* Planeje upgrades anuais
* Teste em staging primeiro


## Troubleshooting comum

### Pods não iniciam

**Sintoma**: Pods ficam em `Pending`

```bash
# Verificar eventos
kubectl describe pod <pod-name>

# Causas comuns:
# 1. Recursos insuficientes
Events:
  Warning  FailedScheduling  pod didn't fit on any node

# Solução: Adicionar mais nodes ou reduzir requests

# 2. Node selector não encontrado
Events:
  Warning  FailedScheduling  no nodes matched pod's node selector

# Solução: Verificar labels dos nodes
kubectl get nodes --show-labels

# 3. Taints não tolerados
Events:
  Warning  FailedScheduling  node(s) had taint that pod didn't tolerate

# Solução: Adicionar tolerations ou remover taints
```

### Pods não conseguem acessar AWS

**Sintoma**: `AccessDenied` ao chamar APIs AWS

```bash
# Verificar se ServiceAccount tem annotation
kubectl get sa <service-account> -o yaml

# Deve ter:
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::...

# Verificar se pod usa o ServiceAccount
kubectl get pod <pod-name> -o yaml | grep serviceAccountName

# Verificar logs do pod
kubectl logs <pod-name>

# Testar credenciais dentro do pod
kubectl exec -it <pod-name> -- env | grep AWS
```

### DNS não resolve

**Sintoma**: `nslookup` falha dentro dos pods

```bash
# Verificar CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Verificar logs do CoreDNS
kubectl logs -n kube-system -l k8s-app=kube-dns

# Testar DNS de um pod
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup kubernetes.default

# Verificar configuração
kubectl get configmap coredns -n kube-system -o yaml
```

### Nodes não aparecem

**Sintoma**: `kubectl get nodes` não mostra nodes

```bash
# Verificar node group
aws eks describe-nodegroup \
  --cluster-name meu-cluster \
  --nodegroup-name workers

# Verificar Auto Scaling Group
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names <asg-name>

# Verificar logs do node (via SSM)
aws ssm start-session --target <instance-id>
sudo journalctl -u kubelet -f
```

Causas comuns:
1. IAM role incorreta
2. Security group bloqueando comunicação
3. Subnet sem rota para internet (para pull de imagens)


## Melhores práticas

### Segurança

1. **Use Pod Identity ou IRSA** - Nunca use credenciais hardcoded
2. **Habilite control plane logs** - Auditoria é essencial
3. **Use Network Policies** - Isole pods entre si
4. **Atualize regularmente** - Patches de segurança são críticos
5. **Restrinja acesso ao API Server** - Use Security Groups e CIDRs
6. **Use Secrets para dados sensíveis** - Nunca em ConfigMaps
7. **Implemente Pod Security Standards** - Evite containers privilegiados

### Performance

1. **Configure resource requests/limits** - Evita noisy neighbors
2. **Use HPA** - Horizontal Pod Autoscaler para escalar pods
3. **Use Cluster Autoscaler ou Karpenter** - Escala nodes automaticamente
4. **Monitore métricas** - Prometheus + Grafana
5. **Use readiness/liveness probes** - Kubernetes sabe quando pod está pronto
6. **Otimize imagens** - Imagens menores = startup mais rápido

### Custos

1. **Use Spot instances** - 70-90% mais barato
2. **Rightsizing** - Não oversized requests
3. **Use Karpenter** - Melhor bin-packing
4. **Fargate para workloads intermitentes** - Pague apenas quando roda
5. **Delete recursos não usados** - LoadBalancers, volumes EBS
6. **Use Savings Plans** - Para workloads previsíveis

### Operacional

1. **Automatize tudo** - GitOps com ArgoCD ou Flux
2. **Documente decisões** - Por que escolheu X ao invés de Y
3. **Teste upgrades** - Sempre em staging primeiro
4. **Tenha runbooks** - Para incidentes comuns
5. **Monitore custos** - Kubecost ou AWS Cost Explorer
6. **Backup de recursos críticos** - Velero para backup de cluster

## Conclusão

O Amazon EKS remove a complexidade de gerenciar o control plane do Kubernetes, mas ainda exige decisões arquiteturais importantes sobre rede, compute, segurança e observabilidade.

Os principais pontos para lembrar:

1. **Planeje a VPC**: CIDR adequado é crítico
2. **Use Pod Identity**: Mais simples que IRSA
3. **Adote Access Entries**: Substitua aws-auth
4. **Monitore tudo**: Logs e métricas são essenciais
5. **Automatize scaling**: Karpenter > Cluster Autoscaler
6. **Considere Auto Mode**: Para novos clusters sem requisitos específicos

A diferença entre clusters que escalam com sucesso e aqueles que acumulam problemas está nas decisões arquiteturais iniciais. Não há "desfazer" um CIDR muito pequeno ou uma arquitetura de rede mal planejada.

EKS não é apenas "Kubernetes gerenciado". É uma plataforma completa que integra profundamente com o ecossistema AWS. Entender essa integração é a chave para arquiteturas bem-sucedidas.