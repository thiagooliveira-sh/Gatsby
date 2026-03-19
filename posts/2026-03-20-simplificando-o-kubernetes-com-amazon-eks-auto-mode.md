---
image: /assets/img/AWS.png
title: Simplificando o Kubernetes com Amazon EKS Auto Mode
description: Neste artigo exploramos o Amazon EKS Auto Mode, uma nova abordagem
  da AWS para simplificar a operação de clusters Kubernetes. Vamos entender como
  o recurso automatiza o provisionamento de infraestrutura, gerenciamento de nós
  e escalabilidade, permitindo que equipes foquem mais nas aplicações e menos na
  gestão do cluster.
date: 2026-03-19
category: aws
background: "#FF9900"
tags:
  - AMAZONEKS
  - EKS
  - EKSAUTOMODE
  - KUBERNETES
  - AWS
  - AWSCLOUD
  - AWSEKS
  - KUBERNETESAWS
  - DEVOPS
  - CLOUDCOMPUTING
  - CONTAINERORCHESTRATION
  - KUBERNETESOPERATIONS
  - KUBERNETESAUTOMATION
  - PLATFORMENGINEERING
  - CLOUDARCHITECTURE
  - INFRASTRUCTUREASCODE
  - KARPENTER
  - KUBERNETESSCALING
  - EKSBESTPRACTICES
  - AWSCONTAINERS
categories:
  - AMAZONEKS
  - EKS
  - EKSAUTOMODE
  - KUBERNETES
  - AWS
  - AWSCLOUD
  - AWSEKS
  - KUBERNETESAWS
  - DEVOPS
  - CLOUDCOMPUTING
  - CONTAINERORCHESTRATION
  - KUBERNETESOPERATIONS
  - KUBERNETESAUTOMATION
  - PLATFORMENGINEERING
  - CLOUDARCHITECTURE
  - INFRASTRUCTUREASCODE
  - KARPENTER
  - KUBERNETESSCALING
  - EKSBESTPRACTICES
  - AWSCONTAINERS
---
Nos artigos anteriores, exploramos a [arquitetura do Amazon EKS](https://thiagoalexandria.com.br/amazon-eks-arquitetura-e-primeiros-passos/) e como o [Karpenter revolucionou o auto scaling](https://thiagoalexandria.com.br/revolucionando-auto-scaling-no-eks-com-karpenter/) de workloads Kubernetes. Agora, a AWS dá mais um passo nessa evolução com o Amazon EKS Auto Mode, lançado no re:Invent 2024.

A proposta é direta: ao invés de você gerenciar nodes, instalar add-ons, configurar Karpenter, AWS Load Balancer Controller, EBS CSI Driver, VPC CNI e Pod Identity Agent separadamente, o Auto Mode faz tudo isso por você. Você foca nas aplicações, a AWS cuida da infraestrutura.

Neste artigo, você vai aprender:

* O que é o EKS Auto Mode e qual problema ele resolve
* O que ele gerencia automaticamente (e o que não gerencia)
* Diferenças entre EKS Standard, Karpenter self-managed e Auto Mode
* Como os NodePools e NodeClasses funcionam no Auto Mode
* Modelo de preços
* Como criar um cluster com Auto Mode
* Como habilitar Auto Mode em um cluster existente
* Limitações e quando não usar
* Boas práticas

## O problema que o Auto Mode resolve

Operar um cluster EKS em produção exige gerenciar muitas peças:

```
O que você precisa instalar e manter:
├── Karpenter (ou Cluster Autoscaler)
├── AWS Load Balancer Controller
├── EBS CSI Driver
├── VPC CNI Plugin
├── CoreDNS
├── kube-proxy
├── Pod Identity Agent (ou IRSA)
├── Metrics Server
└── AMIs dos nodes (patches, updates)
```

Cada componente tem seu ciclo de vida, versão, configuração e possíveis breaking changes. Em um cenário com múltiplos clusters, a complexidade operacional escala rápido.

**O custo operacional real**:

* Atualizar Karpenter: testar compatibilidade, validar NodePools, rollout gradual
* Atualizar AWS LB Controller: verificar annotations, testar Ingress/Services
* Patches de AMI: criar nova AMI, testar, rolling update dos nodes
* EBS CSI Driver: manter versão compatível com o cluster
* Troubleshooting: quando algo quebra, debugar componentes que rodam como pods no cluster

O Auto Mode elimina essa carga operacional movendo esses componentes para fora do cluster, gerenciados pela AWS.

## O que é o EKS Auto Mode

EKS Auto Mode é um modo de operação do Amazon EKS onde a AWS gerencia automaticamente compute, networking e storage do seu cluster. Lançado no re:Invent 2024, ele combina as melhores práticas de Kubernetes com automação completa da infraestrutura.

### O que a AWS gerencia por você

Componentes gerenciados pelo Auto Mode:

**Compute:**

* Karpenter (auto-scaling)
* Provisionamento de nodes (EC2)
* AMI dos nodes (Bottlerocket)
* Patches e updates de OS
* Ciclo de vida dos nodes (max 21 dias)

**Networking:**

* VPC CNI Plugin
* AWS Load Balancer Controller (ALB/NLB)
* Pod Identity Agent

**Storage:**

* EBS CSI Driver
* Provisionamento de volumes

**Segurança:**

* IMDSv2 obrigatório
* Bottlerocket (OS minimalista e seguro)
* Pod Identity integrado

### O que continua sendo sua responsabilidade

* Versão do cluster (upgrades de K8s)
* Configuração de NodePools customizados
* Definição de workloads (Deployments, Services)
* RBAC e Access Entries
* Network Policies
* Observabilidade (logs de aplicação, métricas)
* StorageClass (precisa criar manualmente)
* Configuração de VPC e subnets

### Onde os componentes rodam

Uma diferença fundamental do Auto Mode: os componentes gerenciados rodam **fora do seu cluster**, na infraestrutura da AWS.

#### EKS Standard

**Seu Cluster:**

* Karpenter (pod)
* aws-load-balancer (pod)
* ebs-csi-driver (pod)
* vpc-cni (daemonset)
* coredns (pod)
* seus workloads

#### EKS Auto Mode

**Gerenciado pela AWS:**

* Karpenter
* AWS Load Balancer Controller
* EBS CSI Driver
* VPC CNI
* Pod Identity Agent

**Seu Cluster:**

* metrics-server (pod)
* coredns (pod)
* seus workloads

**Vantagem**: Menos pods consumindo recursos no cluster. Menos superfície de ataque. Menos coisas para debugar.

**Desvantagem**: Menos visibilidade nos logs desses componentes. Se algo não funciona como esperado, você precisa abrir um ticket de suporte.

## EKS Standard vs Karpenter Self-Managed vs Auto Mode

| Aspecto                 | EKS Standard (CAS)     | EKS + Karpenter          | EKS Auto Mode       |
| ----------------------- | ---------------------- | ------------------------ | ------------------- |
| **Auto-scaling**        | Cluster Autoscaler     | Karpenter (self-managed) | Karpenter (managed) |
| **Provisionamento**     | Node Groups (ASG)      | EC2 Fleet API            | EC2 (managed)       |
| **Velocidade**          | 3-6 min                | 60-90s                   | 60-90s              |
| **AMI**                 | Você escolhe           | Você escolhe             | Bottlerocket (fixo) |
| **Load Balancer**       | Instalar LB Controller | Instalar LB Controller   | Gerenciado          |
| **Storage**             | Instalar EBS CSI       | Instalar EBS CSI         | Gerenciado          |
| **Patches de OS**       | Manual                 | Manual                   | Automático          |
| **Ciclo de vida nodes** | Manual                 | expireAfter              | Max 21 dias         |
| **Custo adicional**     | Nenhum                 | Nenhum                   | Management fee      |
| **Visibilidade**        | Total                  | Total                    | Limitada            |
| **Customização AMI**    | Total                  | Total                    | Não suportado       |
| **Complexidade**        | Alta                   | Média                    | Baixa               |

### Quando usar cada abordagem

**EKS Standard (Cluster Autoscaler)**:

* Clusters legados que ainda não migraram
* Equipes com pouca experiência em Kubernetes
* Workloads simples com poucos node groups

**EKS + Karpenter (self-managed)**:

* Máximo controle sobre infraestrutura
* Necessidade de AMIs customizadas
* Requisitos específicos de compliance
* Equipe de plataforma experiente

**EKS Auto Mode**:

* Equipes que querem focar em aplicações
* Clusters novos sem requisitos especiais de AMI
* Reduzir carga operacional
* Startups e equipes pequenas

## Como o Auto Mode funciona internamente

### Compute: Karpenter gerenciado

O Auto Mode usa Karpenter internamente para auto-scaling. A diferença é que você não precisa instalar, configurar ou atualizar o Karpenter. A AWS faz isso.

O comportamento é o mesmo que já exploramos no [artigo sobre Karpenter](https://thiagoalexandria.com.br/revolucionando-auto-scaling-no-eks-com-karpenter/):

```
Pod pending
    ↓
Karpenter (managed) analisa requirements
    ↓
Escolhe melhor instância EC2
    ↓
Provisiona node com Bottlerocket
    ↓
Node registra no cluster
    ↓
Pod é agendado
    ↓
~60-90 segundos
```

### NodePools built-in

Ao criar um cluster com Auto Mode, dois NodePools são criados automaticamente:

**1. general-purpose**:

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: general-purpose
spec:
  template:
    spec:
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["on-demand"]
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c", "m", "r"]
      - key: karpenter.k8s.aws/instance-generation
        operator: Gt
        values: ["4"]
      - key: kubernetes.io/arch
        operator: In
        values: ["amd64"]
      - key: kubernetes.io/os
        operator: In
        values: ["linux"]
      nodeClassRef:
        group: eks.amazonaws.com
        kind: NodeClass
        name: default
  disruption:
    budgets:
    - nodes: "10%"
    consolidationPolicy: WhenEmptyOrUnderutilized
```

**Características**:

* On-Demand apenas (sem Spot por padrão)
* Instâncias C, M, R (geração 5+)
* AMD64 e Linux
* Consolidação quando vazio ou subutilizado
* Budget de disrupção de 10%

**2. system**:

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: system
spec:
  template:
    spec:
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["on-demand"]
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c", "m", "r"]
      - key: karpenter.k8s.aws/instance-generation
        operator: Gt
        values: ["4"]
      - key: kubernetes.io/arch
        operator: In
        values: ["amd64", "arm64"]
      - key: kubernetes.io/os
        operator: In
        values: ["linux"]
      taints:
      - key: CriticalAddonsOnly
        effect: NoSchedule
      nodeClassRef:
        group: eks.amazonaws.com
        kind: NodeClass
        name: default
  disruption:
    budgets:
    - nodes: "10%"
    consolidationPolicy: WhenEmptyOrUnderutilized
```

**Características**:

* Suporta AMD64 e ARM64 (Graviton)
* Taint `CriticalAddonsOnly` (apenas add-ons do sistema)
* Usado internamente pelo EKS para componentes críticos

### NodePools customizados

Você pode criar NodePools adicionais para workloads específicos, exatamente como faria com Karpenter self-managed:

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: spot-workloads
spec:
  template:
    spec:
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot", "on-demand"]
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c", "m", "r"]
      - key: karpenter.k8s.aws/instance-generation
        operator: Gt
        values: ["4"]
      - key: kubernetes.io/arch
        operator: In
        values: ["amd64"]
      nodeClassRef:
        group: eks.amazonaws.com
        kind: NodeClass
        name: default
      taints:
      - key: workload-type
        value: spot-tolerant
        effect: NoSchedule
  limits:
    cpu: 500
    memory: 1000Gi
  disruption:
    consolidationPolicy: WhenEmptyOrUnderutilized
    budgets:
    - nodes: "10%"
```

**Importante**: No Auto Mode, o `nodeClassRef` usa `group: eks.amazonaws.com` e `kind: NodeClass` ao invés de `kind: EC2NodeClass`. A NodeClass `default` é gerenciada pela AWS.

### NodeClass no Auto Mode

Diferente do Karpenter self-managed onde você cria EC2NodeClass com subnets, security groups e AMI, no Auto Mode a NodeClass `default` é gerenciada pela AWS:

Karpenter Self-Managed:

* Você cria EC2NodeClass
* Define subnets, SGs, AMI, blockDeviceMappings
* Controle total

Auto Mode:

* NodeClass "default" gerenciada pela AWS
* Bottlerocket como AMI (fixo)
* Subnets e SGs configurados automaticamente
* Você pode criar NodeClasses customizadas (limitado)

### Networking: Load Balancer gerenciado

O Auto Mode inclui o AWS Load Balancer Controller gerenciado. Você cria Ingress e Services normalmente:

```yaml
# Ingress com ALB (Auto Mode gerencia)
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
```

```yaml
# Service com NLB (Auto Mode gerencia)
apiVersion: v1
kind: Service
metadata:
  name: api-nlb
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

O comportamento é idêntico ao AWS Load Balancer Controller que você instalaria manualmente. A diferença é que a AWS gerencia a versão e configuração.

### Storage: EBS CSI gerenciado

O Auto Mode gerencia o EBS CSI Driver, mas você precisa criar a StorageClass manualmente:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.eks.amazonaws.com
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
parameters:
  type: gp3
  fsType: ext4
  encrypted: "true"
```

**Importante**: O provisioner no Auto Mode é `ebs.csi.eks.amazonaws.com` (não `ebs.csi.aws.com`). Essa diferença é sutil mas crítica.

Uso com PVC:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: ebs-gp3
  resources:
    requests:
      storage: 50Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: app-data
```

### Ciclo de vida dos nodes

No Auto Mode, nodes têm um tempo máximo de vida de 21 dias. Após esse período, o node é automaticamente substituído:

```
Dia 1: Node provisionado com Bottlerocket v1.x
    ↓
Dia 7: Consolidação se subutilizado
    ↓
Dia 14: Continua rodando normalmente
    ↓
Dia 21: Node marcado para substituição
    ↓
Novo node provisionado
    ↓
Pods drenados (respeitando PDBs)
    ↓
Node antigo terminado
```

**Benefícios**:

* AMI sempre atualizada (patches de segurança)
* Sem drift de configuração
* Nodes "frescos" com menos fragmentação de memória

**Importante**: Configure PDBs em todos os deployments críticos para garantir zero downtime durante substituições.

## Modelo de preços

O Auto Mode cobra uma taxa de gerenciamento (management fee) sobre as instâncias EC2 que ele gerencia. Essa taxa é adicional ao preço normal da instância EC2.

Custo total = Preço EC2 da instância + Management fee do Auto Mode

Exemplo com m5.xlarge (us-east-1):

* EC2 On-Demand: $0.192/hora
* Auto Mode fee: varia por tipo de instância
* Total: EC2 price + Auto Mode fee

**Pontos importantes sobre preços**:

* A management fee é cobrada por segundo (mínimo 1 minuto)
* Você pode usar Savings Plans, Reserved Instances e Spot com Auto Mode
* A management fee é independente do tipo de compra da EC2 (On-Demand, Spot, RI)
* Para mais de 150 nodes, entre em contato com a AWS para preços customizados

**Comparação de custos**:

EKS Standard + Karpenter:

* Control plane: $0.10/hora ($73/mês)
* EC2 instances: preço normal
* Karpenter: gratuito (open source)
* Overhead: pods do Karpenter, LB Controller, EBS CSI consumindo recursos
* Custo operacional: tempo da equipe gerenciando componentes

EKS Auto Mode:

* Control plane: $0.10/hora ($73/mês)
* EC2 instances: preço normal + management fee
* Componentes: gerenciados pela AWS (sem overhead no cluster)
* Custo operacional: significativamente menor

**Quando o Auto Mode compensa financeiramente**:

O management fee adicional pode ser compensado por:

1. Menos recursos consumidos por componentes no cluster
2. Menos tempo da equipe gerenciando infraestrutura
3. Melhor bin-packing e consolidação automática
4. Patches automáticos (sem downtime planejado para updates)

## Criando um cluster com Auto Mode

### Via eksctl

```yaml
# cluster-auto-mode.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: meu-cluster-auto
  region: us-east-1
  version: "1.31"

autoModeConfig:
  enabled: true
```

```bash
# Criar cluster
eksctl create cluster -f cluster-auto-mode.yaml

# Verificar
kubectl get nodes
kubectl get nodepools
kubectl get nodeclasses
```

### Via AWS CLI

```bash
# Criar cluster com Auto Mode
aws eks create-cluster \
  --name meu-cluster-auto \
  --role-arn arn:aws:iam::123456789012:role/EKSClusterRole \
  --resources-vpc-config subnetIds=subnet-abc,subnet-def,securityGroupIds=sg-123 \
  --kubernetes-version 1.35 \
  --compute-config enabled=true,nodePools=general-purpose,nodePools=system,nodeRoleArn=arn:aws:iam::123456789012:role/EKSAutoNodeRole \
  --kubernetes-network-config elasticLoadBalancing=enabled=true \
  --storage-config blockStorage=enabled=true
```

### Verificando o cluster

```bash
# Ver NodePools criados automaticamente
kubectl get nodepools

# Resultado:
NAME              NODECLASS   NODES   READY   AGE
general-purpose   default     0       True    5m
system            default     0       True    5m

# Ver NodeClass
kubectl get nodeclasses

# Resultado:
NAME      AGE
default   5m

# Verificar que não há pods de infraestrutura
kubectl get pods -n kube-system

# Resultado (apenas metrics-server e coredns):
NAME                              READY   STATUS    RESTARTS   AGE
coredns-5d78c9869d-abc12         1/1     Running   0          5m
coredns-5d78c9869d-def34         1/1     Running   0          5m
metrics-server-6d94bc8694-xyz56  1/1     Running   0          5m
```

Note que não há pods do Karpenter, AWS Load Balancer Controller, EBS CSI Driver ou VPC CNI. Todos rodam fora do cluster.

## Habilitando Auto Mode em um cluster existente

Se você já tem um cluster EKS rodando com Karpenter self-managed, pode migrar para Auto Mode.

### Pré-requisitos

1. Cluster EKS versão 1.29+
2. IAM roles configuradas para Auto Mode
3. Add-ons atualizados

### Passo a passo

**1. Criar IAM Role para nodes do Auto Mode**:

```bash
# Trust policy para Auto Mode
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Criar role
aws iam create-role \
  --role-name EKSAutoNodeRole \
  --assume-role-policy-document file://trust-policy.json

# Anexar policies necessárias
aws iam attach-role-policy \
  --role-name EKSAutoNodeRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSWorkerNodeMinimalPolicy

aws iam attach-role-policy \
  --role-name EKSAutoNodeRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPullOnly
```

**2. Habilitar Auto Mode no cluster**:

```bash
aws eks update-cluster-config \
  --name meu-cluster \
  --compute-config enabled=true,nodePools=general-purpose,nodePools=system,nodeRoleArn=arn:aws:iam::123456789012:role/EKSAutoNodeRole \
  --kubernetes-network-config elasticLoadBalancing=enabled=true \
  --storage-config blockStorage=enabled=true
```

**3. Verificar que Auto Mode está habilitado**:

```bash
aws eks describe-cluster --name meu-cluster \
  --query 'cluster.computeConfig'

# Resultado:
{
  "enabled": true,
  "nodePools": ["general-purpose", "system"],
  "nodeRoleArn": "arn:aws:iam::123456789012:role/EKSAutoNodeRole"
}
```

**4. Remover componentes que agora são gerenciados**:

```bash
# Remover Karpenter
helm uninstall karpenter -n karpenter
kubectl delete namespace karpenter

# Remover AWS Load Balancer Controller
helm uninstall aws-load-balancer-controller -n kube-system

# Remover EBS CSI Driver (se instalado via Helm)
helm uninstall aws-ebs-csi-driver -n kube-system

# Remover add-on EBS CSI (se instalado via EKS add-on)
aws eks delete-addon --cluster-name meu-cluster --addon-name aws-ebs-csi-driver

# Remover add-on VPC CNI (se gerenciado como add-on)
# CUIDADO: o Auto Mode assume o gerenciamento, não delete manualmente
```

**5. Migrar workloads gradualmente**:

```bash
# Verificar NodePools do Auto Mode
kubectl get nodepools

# Cordon nodes antigos (managed node group)
kubectl cordon -l eks.amazonaws.com/nodegroup=old-nodegroup

# Drenar gradualmente
kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data

# Auto Mode provisiona novos nodes automaticamente

# Após migração completa, deletar node group antigo
aws eks delete-nodegroup \
  --cluster-name meu-cluster \
  --nodegroup-name old-nodegroup
```

### Cuidados na migração

**StorageClass**: Se você usava `ebs.csi.aws.com` como provisioner, precisa criar uma nova StorageClass com `ebs.csi.eks.amazonaws.com`:

```yaml
# Nova StorageClass para Auto Mode
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3-auto
provisioner: ebs.csi.eks.amazonaws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  encrypted: "true"
```

**IngressClass**: Se você usava o AWS Load Balancer Controller self-managed, verifique que o `ingressClassName: alb` continua funcionando com o controller gerenciado.

**NodePools do Karpenter**: Se você tinha NodePools customizados, recrie-os usando o formato do Auto Mode (`nodeClassRef` com `group: eks.amazonaws.com`).

## Limitações do Auto Mode

### 1. AMI fixa (Bottlerocket) e sem User Data

Diferente do EKS padrão, onde você pode escolher a AMI e customizar o bootstrap dos nodes via User Data (scripts de inicialização, instalação de agentes, configurações de kernel), o Auto Mode remove completamente essa possibilidade.

EKS Padrão:

* Escolha de AMI: AL2, AL2023, Ubuntu, customizada
* User Data: scripts de bootstrap customizados
* Exemplo: instalar agente de segurança, configurar sysctl, montar NFS

EKS Auto Mode:

* AMI: Bottlerocket (fixo, sem opção)
* User Data: NÃO suportado
* Customização de OS: NÃO suportado

O Bottlerocket é um OS minimalista desenvolvido pela AWS especificamente para containers. Ele já vem com hardening de segurança aplicado por padrão:

* Filesystem read-only (imutável)
* Sem shell interativo por padrão
* Sem gerenciador de pacotes (não tem yum, apt)
* SELinux habilitado
* Atualizações atômicas (rollback automático se falhar)
* Superfície de ataque reduzida (apenas o necessário para rodar containers)

Isso é uma vantagem do ponto de vista de segurança, mas significa que qualquer software que antes era instalado via User Data agora precisa rodar como DaemonSet.

**Impacto**: Se você precisa de software específico no host (agentes de segurança, monitoring agents), precisa rodar como DaemonSet ao invés de instalar na AMI.

```yaml
# Exemplo: Security agent como DaemonSet
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: security-agent
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: security-agent
  template:
    metadata:
      labels:
        app: security-agent
    spec:
      tolerations:
      - operator: Exists  # Rodar em todos os nodes
      containers:
      - name: agent
        image: security-vendor/agent:latest
        securityContext:
          privileged: true
        volumeMounts:
        - name: host-root
          mountPath: /host
          readOnly: true
      volumes:
      - name: host-root
        hostPath:
          path: /
```

### 2. Visibilidade limitada

Componentes off-cluster (sem acesso a logs):

* Karpenter
* AWS Load Balancer Controller
* EBS CSI Driver
* VPC CNI

Para troubleshooting desses componentes:

* Abrir ticket de suporte AWS

**Impacto**: Se um Ingress não cria o ALB esperado, ou um PVC não provisiona o volume, você não consegue ver os logs do controller para debugar. Precisa confiar nos eventos do Kubernetes e, se necessário, abrir suporte.

```bash
# Verificar eventos (sua principal ferramenta de debug no Auto Mode)
kubectl get events -n production --sort-by='.lastTimestamp'

# Verificar eventos de um recurso específico
kubectl describe ingress app-ingress -n production

# Verificar eventos de PVC
kubectl describe pvc app-data -n production
```

### 3. Ciclo de vida fixo de 21 dias

Nodes são substituídos a cada 21 dias (máximo).

Não configurável:

* Não pode aumentar para 30 dias
* Não pode desabilitar

Impacto:

* Workloads stateful precisam de PDBs bem configurados
* Jobs de longa duração (>21 dias) não são suportados

### 4. Sem privileged containers por padrão

Bottlerocket tem restrições de segurança mais rígidas. Containers privilegiados podem ter comportamento diferente do esperado.

### 5. Nodes não podem ser acessados via SSH

Bottlerocket não tem SSH habilitado por padrão.

Para debug de nodes:

* Use SSM Session Manager
* Use kubectl debug node/<node-name>

```bash
# Debug de node via kubectl
kubectl debug node/ip-10-0-1-123.ec2.internal -it --image=ubuntu

# Via SSM (se habilitado)
aws ssm start-session --target i-1234567890abcdef0
```

### 6. Nodes não podem ser terminados pelo console EC2

Diferente do EKS padrão, onde você pode terminar uma instância EC2 diretamente pelo console da AWS ou via `aws ec2 terminate-instances`, no Auto Mode os nodes são gerenciados exclusivamente pelo Karpenter. Tentar terminar pelo console não funciona como esperado, o Karpenter pode reprovisionar o node imediatamente ou o cluster pode entrar em estado inconsistente.

EKS Padrão:

* Terminar via console EC2: Sim
* Terminar via aws ec2 terminate-instances: Sim
* Terminar via kubectl: Sim

EKS Auto Mode:

* Terminar via console EC2: Não (não recomendado)
* Terminar via aws ec2 terminate-instances: Não (não recomendado)
* Terminar via kubectl: Sim (forma correta)

Para remover ou substituir nodes no Auto Mode, use comandos kubectl:

```bash
# Cordon (impedir novos pods de serem agendados)
kubectl cordon <node-name>

# Drain (drenar pods respeitando PDBs)
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Deletar node (Karpenter gerencia o terminate da EC2)
kubectl delete node <node-name>
```

Se precisar forçar a substituição de todos os nodes (por exemplo, após uma atualização):

```bash
# Listar nodes do Auto Mode
kubectl get nodes -l karpenter.sh/registered=true

# Anotar node para forçar drift (substituição)
kubectl annotate node <node-name> karpenter.sh/do-not-disrupt-

# Ou deletar o node diretamente
kubectl delete node <node-name>
# Karpenter provisiona um novo automaticamente
```

## Boas práticas para Auto Mode

### 1. Sempre configure PDBs

Com nodes sendo substituídos a cada 21 dias e consolidação ativa, PDBs são obrigatórios:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: api
```

### 2. Defina resource requests em todos os pods

O Karpenter gerenciado usa requests para decidir qual instância provisionar:

```yaml
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 1000m
    memory: 2Gi
```

### 3. Use topology spread para Multi-AZ

```yaml
topologySpreadConstraints:
- maxSkew: 1
  topologyKey: topology.kubernetes.io/zone
  whenUnsatisfiable: DoNotSchedule
  labelSelector:
    matchLabels:
      app: api
```

### 4. Crie NodePools customizados para Spot

O NodePool `general-purpose` usa apenas On-Demand. Para economia, crie um NodePool com Spot:

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: spot-workloads
spec:
  template:
    spec:
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot", "on-demand"]
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c", "m", "r"]
      - key: karpenter.k8s.aws/instance-generation
        operator: Gt
        values: ["4"]
      nodeClassRef:
        group: eks.amazonaws.com
        kind: NodeClass
        name: default
  limits:
    cpu: 500
    memory: 1000Gi
  disruption:
    consolidationPolicy: WhenEmptyOrUnderutilized
    budgets:
    - nodes: "10%"
```

### 5. Crie a StorageClass logo após criar o cluster

O Auto Mode não cria StorageClass automaticamente:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.eks.amazonaws.com
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
parameters:
  type: gp3
  encrypted: "true"
```

### 6. Use DaemonSets para agentes de host

Como não é possível customizar a AMI, qualquer software que precisa rodar no host deve ser um DaemonSet:

* Agentes de segurança (Falco, Sysdig)
* Monitoring agents (Datadog, New Relic)
* Log collectors (Fluent Bit)

### 7. Monitore eventos do cluster

Sem acesso aos logs dos componentes gerenciados, eventos são sua principal fonte de informação:

```bash
# Monitorar eventos em tempo real
kubectl get events -A --watch

# Filtrar eventos de warning
kubectl get events -A --field-selector type=Warning
```

### 8. Mantenha nodes mistos se necessário

Você pode rodar Auto Mode nodes junto com Managed Node Groups no mesmo cluster:

```
Cluster híbrido:
├── Auto Mode nodes (workloads gerais)
├── Managed Node Group (workloads que precisam de AMI customizada)
└── Fargate (workloads serverless)
```

Isso permite migração gradual e atende requisitos específicos que o Auto Mode não suporta.

## Deploy de exemplo completo

Vamos criar uma aplicação completa no Auto Mode:

```yaml
# 1. StorageClass
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.eks.amazonaws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  encrypted: "true"
---
# 2. Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: production
spec:
  replicas: 6
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: api
      containers:
      - name: api
        image: myapp:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 1000m
            memory: 2Gi
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 20
---
# 3. PDB
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
  namespace: production
spec:
  minAvailable: 4
  selector:
    matchLabels:
      app: api
---
# 4. Service
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: production
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
# 5. Ingress (ALB gerenciado pelo Auto Mode)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: production
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /health
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
```

```bash
# Aplicar
kubectl apply -f app.yaml

# Verificar nodes provisionados pelo Auto Mode
kubectl get nodes -o wide

# Verificar distribuição entre AZs
kubectl get pods -n production -o wide

# Verificar ALB criado
kubectl get ingress -n production
```

O Auto Mode provisiona os nodes necessários, cria o ALB via controller gerenciado, e distribui os pods entre AZs automaticamente.

## Troubleshooting no Auto Mode

### Pods ficam pending

```bash
# Verificar eventos
kubectl describe pod <pod-name> -n <namespace>

# Causas comuns:
# 1. NodePool não atende requirements do pod
kubectl get nodepools -o yaml

# 2. Limits do NodePool atingidos
kubectl get nodepools -o yaml | grep limits

# 3. Taints sem tolerations
kubectl describe pod <pod-name> | grep -A5 Tolerations
```

### Ingress não cria ALB

```bash
# Verificar eventos do Ingress
kubectl describe ingress <ingress-name> -n <namespace>

# Verificar IngressClass
kubectl get ingressclass

# Verificar se Auto Mode networking está habilitado
aws eks describe-cluster --name meu-cluster \
  --query 'cluster.kubernetesNetworkConfig.elasticLoadBalancing'
```

### PVC não provisiona volume

```bash
# Verificar eventos do PVC
kubectl describe pvc <pvc-name> -n <namespace>

# Verificar StorageClass
kubectl get storageclass

# Verificar se o provisioner está correto
# Deve ser: ebs.csi.eks.amazonaws.com (NÃO ebs.csi.aws.com)
kubectl get storageclass -o yaml | grep provisioner

# Verificar se Auto Mode storage está habilitado
aws eks describe-cluster --name meu-cluster \
  --query 'cluster.storageConfig'
```

### Nodes não consolidam

```bash
# Verificar configuração de disruption do NodePool
kubectl get nodepool general-purpose -o yaml | grep -A10 disruption

# Verificar PDBs que podem estar bloqueando
kubectl get pdb -A

# Verificar utilização dos nodes
kubectl top nodes
```

## Conclusão

O EKS Auto Mode representa uma evolução natural na operação de Kubernetes na AWS. Ao mover componentes críticos como Karpenter, AWS Load Balancer Controller, EBS CSI Driver e VPC CNI para fora do cluster, ele reduz significativamente a carga operacional.

É a escolha certa quando:

* Você quer focar em aplicações, não em infraestrutura
* Não precisa de AMIs customizadas
* Aceita Bottlerocket como OS dos nodes
* Quer patches automáticos e ciclo de vida gerenciado

Não é a escolha certa quando:

* Precisa de controle total sobre AMIs
* Precisa de visibilidade completa nos logs dos componentes
* Tem requisitos de compliance que exigem AMIs específicas
* Precisa de nodes com vida útil maior que 21 dias

O Auto Mode não substitui o conhecimento de Kubernetes. Entender como [o EKS funciona internamente](https://thiagoalexandria.com.br/amazon-eks-arquitetura-e-primeiros-passos/) e como [o Karpenter opera](https://thiagoalexandria.com.br/revolucionando-auto-scaling-no-eks-com-karpenter/) continua sendo essencial para tomar boas decisões, mesmo com Auto Mode. A diferença é que agora você pode aplicar esse conhecimento sem precisar gerenciar cada peça manualmente.
