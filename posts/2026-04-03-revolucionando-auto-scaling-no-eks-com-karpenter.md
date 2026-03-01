---
image: /assets/img/AWS.png
title: Revolucionando Auto Scaling no EKS com Karpenter
description: O Cluster Autoscaler serviu bem por anos, mas tem limitações fundamentais que impactam custo e performance. O Karpenter muda o jogo ao provisionar nodes sob demanda em segundos, escolher automaticamente os melhores tipos de instância, e consolidar recursos de forma inteligente. Entenda como funciona, quando migrar, e as práticas essenciais para extrair o máximo dessa ferramenta.
date: 2026-04-03
category: aws
background: "#FF9900"
tags:
  - KARPENTER
  - AWSEKS
  - AUTOSCALING
  - KUBERNETES
  - COSTOPTIMIZATION
  - SPOTINSTANCES
  - NODEPROVISIONING
  - CLOUDNATIVE
  - PLATFORMENGINEERING
  - EKSOPTIMIZATION
categories:
  - KARPENTER
  - AWSEKS
  - AUTOSCALING
  - KUBERNETES
  - COSTOPTIMIZATION
  - SPOTINSTANCES
  - NODEPROVISIONING
  - CLOUDNATIVE
  - PLATFORMENGINEERING
  - EKSOPTIMIZATION
---
Escalar nodes no Kubernetes sempre foi um desafio. O Cluster Autoscaler resolve o problema básico, mas com limitações: você precisa pré-definir tipos de instância, esperar minutos para provisionar nodes, e conviver com desperdício de recursos. Em ambientes dinâmicos com workloads variados, essas limitações custam caro.

O Karpenter muda essa equação. Desenvolvido pela AWS e doado à CNCF, ele provisiona nodes sob demanda em ~60 segundos, escolhe automaticamente os melhores tipos de instância para cada workload, e consolida recursos continuamente para eliminar desperdício. O resultado: redução de 30-60% nos custos de compute e melhor utilização de recursos.

Neste artigo, você vai aprender:

* Como o Karpenter funciona internamente
* Diferenças fundamentais entre Karpenter e Cluster Autoscaler
* O que são EC2NodeClass e NodePool
* Boas práticas para configurar NodePools
* Como preparar workloads para Karpenter
* Estratégias de consolidação e interrupção
* Uso eficiente de Spot instances
* Multi-AZ e alta disponibilidade

No final, você terá o conhecimento necessário para implementar Karpenter com confiança e otimizar seus custos de EKS significativamente.

## O problema com o Cluster Autoscaler

Antes de entender o Karpenter, é importante reconhecer as limitações do Cluster Autoscaler:

### Limitação 1: Node Groups pré-definidos

O Cluster Autoscaler só pode escalar node groups que você criou previamente:

```yaml
# Você precisa criar node groups específicos
NodeGroup 1: t3.medium (2 vCPU, 4 GB RAM)
NodeGroup 2: m5.large (2 vCPU, 8 GB RAM)
NodeGroup 3: c5.xlarge (4 vCPU, 8 GB RAM)
```

**Problema**: Se um pod precisa de 3 vCPU, nenhum desses node groups é ideal. Você vai desperdiçar recursos ou o pod ficará pending.

### Limitação 2: Escala lenta

```
Pod fica pending
    ↓
Cluster Autoscaler detecta (30-60s)
    ↓
Solicita nova instância ao ASG
    ↓
EC2 provisiona instância (2-5 min)
    ↓
Node se registra no cluster (30s)
    ↓
Pod é agendado
    ↓
Total: 3-6 minutos
```

### Limitação 3: Bin-packing ineficiente

O Cluster Autoscaler não reorganiza pods para consolidar nodes. Resultado:

```
Node 1: 30% utilizado
Node 2: 25% utilizado
Node 3: 40% utilizado

Você paga por 3 nodes, mas poderia usar apenas 1
```

### Limitação 4: Spot instances complexas

Usar Spot com Cluster Autoscaler exige:
* Criar node groups separados para cada tipo de instância
* Gerenciar interrupções manualmente
* Configurar diversificação de instâncias


## Como o Karpenter funciona

O Karpenter inverte a lógica: ao invés de escalar node groups pré-definidos, ele provisiona nodes sob demanda baseado nas necessidades dos pods.

### Arquitetura do Karpenter

```
┌─────────────────────────────────────────────────┐
│              Kubernetes Cluster                 │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         Karpenter Controller             │  │
│  │                                          │  │
│  │  1. Monitora pods pending                │  │
│  │  2. Analisa requirements                 │  │
│  │  3. Simula bin-packing                   │  │
│  │  4. Escolhe melhor instância             │  │
│  │  5. Provisiona via EC2 API               │  │
│  │  6. Registra node no cluster             │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌──────────────────────────────────────────┐  │
│  │         Nodes provisionados              │  │
│  │                                          │  │
│  │  Node 1: m5.large (escolhido para pod A)│  │
│  │  Node 2: c5.xlarge (escolhido para pod B)│ │
│  │  Node 3: r5.2xlarge (escolhido para pod C)│ │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Fluxo de provisionamento

**1. Pod fica pending**:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    resources:
      requests:
        cpu: 2000m
        memory: 4Gi
  nodeSelector:
    workload-type: compute-intensive
```

**2. Karpenter analisa requirements**:

```
Requirements detectados:
- CPU: 2000m
- Memory: 4Gi
- Node selector: workload-type=compute-intensive
- Topology: nenhuma restrição
- Taints/Tolerations: nenhum
```

**3. Karpenter consulta NodePool**:

```yaml
# NodePool define regras de provisionamento
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
```

**4. Karpenter escolhe melhor instância**:

```
Candidatos:
- c5.xlarge: 4 vCPU, 8 GB → Atende (compute-optimized)
- m5.large: 2 vCPU, 8 GB → CPU insuficiente
- c5.large: 2 vCPU, 4 GB → Atende (mais barato)
- c5.2xlarge: 8 vCPU, 16 GB → Atende (oversized)

Escolhido: c5.large (menor custo que atende)
```

**5. Provisiona em ~60 segundos**:

```
Karpenter → EC2 API: Lançar c5.large spot
    ↓
EC2 provisiona instância
    ↓
Instância inicia com user-data do Karpenter
    ↓
Kubelet se registra no cluster
    ↓
Node fica Ready
    ↓
Pod é agendado
    ↓
Total: ~60-90 segundos
```


## Karpenter vs Cluster Autoscaler

### Comparação detalhada

| Aspecto | Cluster Autoscaler | Karpenter |
|---------|-------------------|-----------|
| **Provisionamento** | Escala node groups pré-definidos | Provisiona nodes sob demanda |
| **Velocidade** | 3-6 minutos | 60-90 segundos |
| **Escolha de instância** | Limitado aos tipos do node group | Escolhe automaticamente entre centenas |
| **Bin-packing** | Básico | Avançado com simulação |
| **Consolidação** | Manual (scale down) | Automática e contínua |
| **Spot instances** | Complexo (múltiplos node groups) | Nativo e simples |
| **Diversificação** | Manual | Automática |
| **Overhead** | Alto (múltiplos ASGs) | Baixo (direto via EC2 API) |
| **Custo** | Maior (desperdício) | 30-60% menor |
| **Configuração** | Node groups + ASG | NodePool + EC2NodeClass |

### Ganhos reais com Karpenter

**1. Redução de custos (30-60%)**:

```
Antes (Cluster Autoscaler):
- 10 nodes m5.xlarge on-demand
- Utilização média: 40%
- Custo: $1,536/mês

Depois (Karpenter):
- 4 nodes diversos (m5.large, c5.xlarge, r5.large)
- 80% spot instances
- Utilização média: 75%
- Custo: $620/mês

Economia: 60% ($916/mês)
```

**2. Provisionamento mais rápido**:

```
Cluster Autoscaler: 3-6 minutos
Karpenter: 60-90 segundos

Ganho: 3-5x mais rápido
```

**3. Melhor utilização de recursos**:

```
Cluster Autoscaler:
- Node 1: 30% CPU, 45% RAM
- Node 2: 25% CPU, 35% RAM
- Node 3: 40% CPU, 50% RAM
Média: 32% CPU, 43% RAM

Karpenter (com consolidação):
- Node 1: 70% CPU, 75% RAM
- Node 2: 65% CPU, 80% RAM
Média: 68% CPU, 78% RAM

Ganho: 2x melhor utilização
```

**4. Spot instances simplificadas**:

```
Cluster Autoscaler:
- Criar node group para cada tipo
- Gerenciar interrupções manualmente
- Configurar diversificação

Karpenter:
- capacity-type: ["spot", "on-demand"]
- Diversificação automática
- Fallback automático para on-demand
```


## EC2NodeClass: Configuração de infraestrutura

O EC2NodeClass define como os nodes serão configurados na AWS. É o equivalente ao Launch Template do ASG, mas gerenciado pelo Karpenter.

### Anatomia do EC2NodeClass

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: default
spec:
  # AMI a ser usada
  amiFamily: AL2
  
  # IAM Role para os nodes
  role: KarpenterNodeRole
  
  # Subnets onde provisionar (tags)
  subnetSelectorTerms:
  - tags:
      karpenter.sh/discovery: my-cluster
  
  # Security Groups
  securityGroupSelectorTerms:
  - tags:
      karpenter.sh/discovery: my-cluster
  
  # User data customizado (opcional)
  userData: |
    #!/bin/bash
    echo "Custom setup"
  
  # Block device mappings
  blockDeviceMappings:
  - deviceName: /dev/xvda
    ebs:
      volumeSize: 100Gi
      volumeType: gp3
      iops: 3000
      throughput: 125
      deleteOnTermination: true
  
  # Metadata options
  metadataOptions:
    httpEndpoint: enabled
    httpProtocolIPv6: disabled
    httpPutResponseHopLimit: 2
    httpTokens: required
  
  # Tags para instâncias EC2
  tags:
    Environment: production
    ManagedBy: karpenter
```

### Campos importantes do EC2NodeClass

**1. amiFamily**:

Define qual AMI usar. Opções:

```yaml
amiFamily: AL2          # Amazon Linux 2 (padrão)
amiFamily: AL2023       # Amazon Linux 2023
amiFamily: Bottlerocket # Bottlerocket OS
amiFamily: Ubuntu       # Ubuntu
```

**Recomendação**: Use `AL2023` para novos clusters (suporte estendido, melhor performance).

**2. subnetSelectorTerms**:

Seleciona subnets via tags:

```yaml
subnetSelectorTerms:
- tags:
    karpenter.sh/discovery: my-cluster
    Environment: production
```

**Boa prática**: Use tags específicas para controlar onde nodes são provisionados.

**3. securityGroupSelectorTerms**:

Seleciona security groups:

```yaml
securityGroupSelectorTerms:
- tags:
    karpenter.sh/discovery: my-cluster
- id: sg-0123456789abcdef
```

**Boa prática**: Use o security group criado pelo EKS + security groups adicionais se necessário.

**4. blockDeviceMappings**:

Configura discos:

```yaml
blockDeviceMappings:
- deviceName: /dev/xvda
  ebs:
    volumeSize: 100Gi      # Tamanho do disco
    volumeType: gp3        # Tipo (gp3 é mais barato que gp2)
    iops: 3000             # IOPS (gp3 permite customizar)
    throughput: 125        # Throughput MB/s
    encrypted: true        # Criptografia
    deleteOnTermination: true
```

**Boa prática**: Use gp3 (mais barato e performático que gp2). Para workloads I/O intensivos, aumente IOPS.

**5. metadataOptions**:

Configurações de segurança do IMDS:

```yaml
metadataOptions:
  httpEndpoint: enabled
  httpTokens: required    # IMDSv2 obrigatório (segurança)
  httpPutResponseHopLimit: 2
```

**Boa prática**: Sempre use `httpTokens: required` (IMDSv2) para segurança.


### Exemplo completo de EC2NodeClass

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: production
spec:
  amiFamily: AL2023
  role: KarpenterNodeRole-production
  
  subnetSelectorTerms:
  - tags:
      karpenter.sh/discovery: prod-cluster
      tier: private
  
  securityGroupSelectorTerms:
  - tags:
      karpenter.sh/discovery: prod-cluster
  
  blockDeviceMappings:
  - deviceName: /dev/xvda
    ebs:
      volumeSize: 100Gi
      volumeType: gp3
      iops: 3000
      throughput: 125
      encrypted: true
      deleteOnTermination: true
  
  metadataOptions:
    httpEndpoint: enabled
    httpTokens: required
    httpPutResponseHopLimit: 2
  
  tags:
    Environment: production
    ManagedBy: karpenter
    CostCenter: engineering
```


## NodePool: Regras de provisionamento

O NodePool define quais tipos de instâncias o Karpenter pode provisionar e como gerenciar o ciclo de vida dos nodes.

### Anatomia do NodePool

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default
spec:
  # Template para nodes
  template:
    spec:
      # Requirements: restrições de instâncias
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
      - key: karpenter.k8s.aws/instance-generation
        operator: Gt
        values: ["4"]
      
      # NodeClass a usar
      nodeClassRef:
        name: default
      
      # Taints (opcional)
      taints:
      - key: workload-type
        value: batch
        effect: NoSchedule
  
  # Limites de recursos
  limits:
    cpu: 1000
    memory: 1000Gi
  
  # Políticas de disrupção
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 720h  # 30 dias
```

### Requirements: Controlando tipos de instância

Requirements definem quais instâncias o Karpenter pode escolher:

**1. Capacity Type (Spot vs On-Demand)**:

```yaml
# Apenas Spot (máxima economia)
- key: karpenter.sh/capacity-type
  operator: In
  values: ["spot"]

# Spot com fallback para On-Demand (recomendado)
- key: karpenter.sh/capacity-type
  operator: In
  values: ["spot", "on-demand"]

# Apenas On-Demand (workloads críticos)
- key: karpenter.sh/capacity-type
  operator: In
  values: ["on-demand"]
```

**Boa prática**: Use `["spot", "on-demand"]` para workloads stateless. Karpenter tenta Spot primeiro e faz fallback para On-Demand se necessário.

**2. Instance Category (Família de instâncias)**:

```yaml
# Compute-optimized (c5, c6i, c7g)
- key: karpenter.k8s.aws/instance-category
  operator: In
  values: ["c"]

# General purpose (m5, m6i, m7g)
- key: karpenter.k8s.aws/instance-category
  operator: In
  values: ["m"]

# Memory-optimized (r5, r6i, r7g)
- key: karpenter.k8s.aws/instance-category
  operator: In
  values: ["r"]

# Múltiplas categorias (recomendado para diversificação)
- key: karpenter.k8s.aws/instance-category
  operator: In
  values: ["c", "m", "r"]
```

**Boa prática**: Permita múltiplas categorias para aumentar diversificação de Spot e reduzir interrupções.

**3. Instance Generation (Geração)**:

```yaml
# Apenas gerações 5 ou superior
- key: karpenter.k8s.aws/instance-generation
  operator: Gt
  values: ["4"]

# Apenas geração 6
- key: karpenter.k8s.aws/instance-generation
  operator: In
  values: ["6"]
```

**Boa prática**: Use `Gt: ["4"]` para permitir gerações modernas (melhor custo-benefício).

**4. Instance Size (Tamanho)**:

```yaml
# Apenas small e medium
- key: karpenter.k8s.aws/instance-size
  operator: In
  values: ["small", "medium", "large"]

# Excluir tamanhos muito grandes
- key: karpenter.k8s.aws/instance-size
  operator: NotIn
  values: ["8xlarge", "12xlarge", "16xlarge"]
```

**Boa prática**: Evite instâncias muito grandes (blast radius menor, mais flexibilidade).

**5. Architecture (Arquitetura)**:

```yaml
# Apenas AMD64
- key: kubernetes.io/arch
  operator: In
  values: ["amd64"]

# AMD64 e ARM64 (Graviton - mais barato)
- key: kubernetes.io/arch
  operator: In
  values: ["amd64", "arm64"]
```

**Boa prática**: Se suas imagens suportam ARM64, inclua para reduzir custos (~20% mais barato).


### Limits: Controlando crescimento

Limits evitam que o Karpenter provisione recursos ilimitados:

```yaml
limits:
  cpu: 1000        # Máximo de 1000 vCPUs
  memory: 1000Gi   # Máximo de 1000 GB RAM
```

**Boa prática**: Sempre defina limits para evitar custos inesperados.

**Cálculo de limits**:

```
Workload esperado: 50 pods
Cada pod: 2 vCPU, 4 GB RAM
Total: 100 vCPU, 200 GB RAM

Limite recomendado (2x para burst):
cpu: 200
memory: 400Gi
```

### Disruption: Consolidação e expiração

Disruption controla quando o Karpenter pode remover ou substituir nodes:

**1. consolidationPolicy**:

```yaml
# Consolidar quando nodes estão subutilizados
disruption:
  consolidationPolicy: WhenUnderutilized

# Nunca consolidar automaticamente
disruption:
  consolidationPolicy: WhenEmpty
```

**Como funciona WhenUnderutilized**:

```
Cenário:
- Node 1: 20% CPU, 30% RAM
- Node 2: 25% CPU, 35% RAM
- Node 3: 30% CPU, 40% RAM

Karpenter detecta:
"Posso mover todos os pods para 2 nodes"

Ação:
1. Cordona Node 3
2. Drena pods para Node 1 e 2
3. Termina Node 3

Resultado:
- Node 1: 45% CPU, 60% RAM
- Node 2: 50% CPU, 65% RAM
- Economia: 1 node
```

**Boa prática**: Use `WhenUnderutilized` para maximizar economia. Karpenter respeita PDBs durante consolidação.

**2. expireAfter**:

```yaml
# Nodes expiram após 30 dias
disruption:
  expireAfter: 720h

# Nodes expiram após 7 dias
disruption:
  expireAfter: 168h

# Nunca expirar
disruption:
  expireAfter: Never
```

**Por que expirar nodes**:
* Atualizar AMI automaticamente
* Aplicar patches de segurança
* Renovar Spot instances (reduz interrupções)

**Boa prática**: Use `720h` (30 dias) para produção. Garante nodes atualizados sem disrupção frequente.


### Exemplo completo de NodePool

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: general-purpose
spec:
  template:
    spec:
      requirements:
      # Spot com fallback para On-Demand
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot", "on-demand"]
      
      # AMD64 e ARM64 (Graviton)
      - key: kubernetes.io/arch
        operator: In
        values: ["amd64", "arm64"]
      
      # Categorias: compute, general, memory
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c", "m", "r"]
      
      # Gerações modernas (5+)
      - key: karpenter.k8s.aws/instance-generation
        operator: Gt
        values: ["4"]
      
      # Tamanhos: small até 2xlarge
      - key: karpenter.k8s.aws/instance-size
        operator: In
        values: ["small", "medium", "large", "xlarge", "2xlarge"]
      
      nodeClassRef:
        name: default
  
  limits:
    cpu: 500
    memory: 1000Gi
  
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 720h
```

### NodePools especializados

**NodePool para workloads batch**:

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: batch
spec:
  template:
    spec:
      requirements:
      # Apenas Spot (máxima economia)
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot"]
      
      # Compute-optimized
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c"]
      
      # Taints para isolar workloads
      taints:
      - key: workload-type
        value: batch
        effect: NoSchedule
      
      nodeClassRef:
        name: default
  
  limits:
    cpu: 200
  
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 168h  # 7 dias (batch pode tolerar mais disrupção)
```

**NodePool para workloads críticos**:

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: critical
spec:
  template:
    spec:
      requirements:
      # Apenas On-Demand (zero interrupções)
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["on-demand"]
      
      # General purpose
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["m"]
      
      # Apenas AMD64 (máxima compatibilidade)
      - key: kubernetes.io/arch
        operator: In
        values: ["amd64"]
      
      # Taints para garantir isolamento
      taints:
      - key: workload-type
        value: critical
        effect: NoSchedule
      
      nodeClassRef:
        name: default
  
  limits:
    cpu: 100
    memory: 200Gi
  
  disruption:
    consolidationPolicy: WhenEmpty  # Apenas consolida nodes vazios
    expireAfter: Never  # Nunca expira automaticamente
```


## Preparando workloads para Karpenter

O Karpenter funciona melhor quando seus workloads seguem boas práticas do Kubernetes.

### 1. Resource Requests e Limits

**Por que é crítico**:

O Karpenter usa `requests` para decidir qual instância provisionar. Sem requests, o Karpenter não sabe o tamanho necessário.

**Problema sem requests**:

```yaml
# Sem requests
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 10
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        # Sem resources!
```

**Resultado**: Karpenter provisiona instâncias pequenas (não sabe que precisa de mais recursos). Pods ficam com OOMKilled ou throttled.

**Solução com requests**:

```yaml
# Com requests e limits
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 10
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        resources:
          requests:
            cpu: 500m      # Karpenter usa isso
            memory: 1Gi    # Karpenter usa isso
          limits:
            cpu: 1000m     # Kubernetes usa isso
            memory: 2Gi    # Kubernetes usa isso
```

**Como definir requests corretos**:

#### 1. Monitorar uso real
```bash
kubectl top pods -n production
```
#### 2. Analisar histórico (Prometheus)
Queries úteis:
* container_cpu_usage_seconds_total
* container_memory_working_set_bytes

#### 3. Definir requests = P95 do uso
* Se P95 CPU = 400m, use request: 500m
* Se P95 Memory = 800Mi, use request: 1Gi

**Boa prática**:

```yaml
resources:
  requests:
    cpu: P95 + 20%      # Margem de segurança
    memory: P95 + 20%
  limits:
    cpu: 2x requests    # Permite burst
    memory: 1.5x requests  # Evita OOM
```


### 2. Pod Disruption Budgets (PDB)

**Por que é crítico**:

Durante consolidação ou expiração de nodes, o Karpenter drena pods. PDBs garantem que você não perca disponibilidade.

**Problema sem PDB**:

```yaml
# Sem PDB
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  # Sem PDB!
```

**Cenário**:

Karpenter consolida nodes:
1. Drena Node 1 (2 pods da API)
2. Drena Node 2 (1 pod da API)
3. Todos os 3 pods terminam ao mesmo tempo
4. API fica indisponível por 30-60s

Downtime!


**Solução com PDB**:

```yaml
# Com PDB
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
spec:
  minAvailable: 2  # Sempre manter 2 pods rodando
  selector:
    matchLabels:
      app: api
```

**Cenário com PDB**:

Karpenter consolida nodes:
1. Tenta drenar Node 1 (2 pods)
2. PDB permite drenar apenas 1 pod (mantém minAvailable: 2)
3. Aguarda novo pod ficar Ready
4. Drena segundo pod
5. Aguarda novo pod ficar Ready
6. Drena terceiro pod

Zero downtime!


**Estratégias de PDB**:

**minAvailable** (recomendado para alta disponibilidade):

```yaml
# Sempre manter 2 pods
minAvailable: 2

# Sempre manter 80% dos pods
minAvailable: 80%
```

**maxUnavailable** (recomendado para rolling updates):

```yaml
# Permitir 1 pod indisponível
maxUnavailable: 1

# Permitir 25% dos pods indisponíveis
maxUnavailable: 25%
```

**Boa prática**:

```yaml
# Para APIs críticas
minAvailable: N-1  # Se replicas=3, minAvailable=2

# Para workloads batch
maxUnavailable: 50%  # Pode tolerar mais disrupção

# Para single replica (não recomendado, mas se necessário)
maxUnavailable: 0  # Bloqueia consolidação
```

**Exemplo completo**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: api:latest
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
spec:
  minAvailable: 3  # Sempre 3 de 5 rodando
  selector:
    matchLabels:
      app: api
```


### 3. Pod Affinity e Anti-Affinity

**Por que é importante**:

Affinity controla como pods são distribuídos entre nodes. Isso impacta disponibilidade e custo.

**Anti-Affinity: Distribuir pods**

```yaml
# Distribuir pods entre nodes diferentes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: api
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - api
            topologyKey: kubernetes.io/hostname
      containers:
      - name: api
        image: api:latest
```

**Resultado**:

Node 1: api-pod-1
Node 2: api-pod-2
Node 3: api-pod-3

Alta disponibilidade (falha de 1 node não derruba tudo)


**Sem anti-affinity**:

Node 1: api-pod-1, api-pod-2, api-pod-3
Node 2: (vazio)
Node 3: (vazio)

Falha de Node 1 = downtime total

**Anti-Affinity preferencial** (mais flexível):

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - api
        topologyKey: kubernetes.io/hostname
```

**Diferença**:
* `required`: Obrigatório (pod fica pending se não conseguir)
* `preferred`: Preferencial (tenta, mas não bloqueia)

**Boa prática**: Use `preferred` para evitar pods pending. Use `required` apenas para workloads críticos.

**Affinity: Co-localizar pods**

```yaml
# Co-localizar cache com API (reduz latência)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cache
spec:
  template:
    spec:
      affinity:
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - api
            topologyKey: kubernetes.io/hostname
      containers:
      - name: redis
        image: redis:latest
```

**Resultado**:

Node 1: api-pod-1, cache-pod-1
Node 2: api-pod-2, cache-pod-2

Latência mínima entre API e cache



### 4. Topology Spread Constraints

**Por que é importante**:

Distribui pods entre zonas de disponibilidade (AZs) para alta disponibilidade.

**Problema sem topology spread**:

```
AZ us-east-1a: api-pod-1, api-pod-2, api-pod-3
AZ us-east-1b: (vazio)
AZ us-east-1c: (vazio)

Falha de AZ = downtime total
```

**Solução com topology spread**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 6
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
        image: api:latest
```

**Resultado**:
```
AZ us-east-1a: api-pod-1, api-pod-2
AZ us-east-1b: api-pod-3, api-pod-4
AZ us-east-1c: api-pod-5, api-pod-6

Distribuição uniforme entre AZs
```

**Parâmetros**:

* `maxSkew: 1`: Diferença máxima de pods entre AZs
* `topologyKey`: Chave para agrupar (zone, hostname)
* `whenUnsatisfiable`: O que fazer se não conseguir distribuir
  * `DoNotSchedule`: Pod fica pending
  * `ScheduleAnyway`: Agenda mesmo sem distribuição ideal

**Boa prática**:

```yaml
# Para produção (alta disponibilidade)
topologySpreadConstraints:
- maxSkew: 1
  topologyKey: topology.kubernetes.io/zone
  whenUnsatisfiable: DoNotSchedule
  labelSelector:
    matchLabels:
      app: api

# Para desenvolvimento (flexibilidade)
topologySpreadConstraints:
- maxSkew: 2
  topologyKey: topology.kubernetes.io/zone
  whenUnsatisfiable: ScheduleAnyway
  labelSelector:
    matchLabels:
      app: api
```

**Combinando com anti-affinity**:

```yaml
# Distribuir entre AZs E entre nodes
spec:
  topologySpreadConstraints:
  # Distribuir entre AZs
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: api
  # Distribuir entre nodes
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: ScheduleAnyway
    labelSelector:
      matchLabels:
        app: api
```


### 5. Multi-AZ: Garantindo alta disponibilidade

**Por que é crítico**:

Falhas de AZ acontecem. Seus workloads precisam sobreviver a elas.

**Configuração do Karpenter para Multi-AZ**:

```yaml
# EC2NodeClass: Subnets em múltiplas AZs
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: default
spec:
  subnetSelectorTerms:
  - tags:
      karpenter.sh/discovery: my-cluster
      # Subnets em us-east-1a, us-east-1b, us-east-1c
```

**Karpenter distribui nodes automaticamente**:

```
Cenário: 10 pods pending

Karpenter provisiona:
- 3 nodes em us-east-1a
- 4 nodes em us-east-1b
- 3 nodes em us-east-1c

Distribuição automática entre AZs
```

**Forçar distribuição de pods**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 9
  template:
    spec:
      # Distribuir entre AZs
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: api
      
      # Distribuir entre nodes
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - api
              topologyKey: kubernetes.io/hostname
```

**Resultado**:
```
us-east-1a:
  Node 1: api-pod-1
  Node 2: api-pod-2
  Node 3: api-pod-3

us-east-1b:
  Node 4: api-pod-4
  Node 5: api-pod-5
  Node 6: api-pod-6

us-east-1c:
  Node 7: api-pod-7
  Node 8: api-pod-8
  Node 9: api-pod-9

Falha de 1 AZ = 66% de capacidade mantida
```

**Testando resiliência a falha de AZ**:

```bash
# 1. Simular falha de AZ (cordon nodes)
kubectl cordon -l topology.kubernetes.io/zone=us-east-1a

# 2. Verificar distribuição de pods
kubectl get pods -o wide | grep api

# 3. Verificar se aplicação continua funcionando
curl https://api.example.com/health

# 4. Remover simulação
kubectl uncordon -l topology.kubernetes.io/zone=us-east-1a
```

**Boa prática para Multi-AZ**:

1. **Sempre use 3 AZs** (mínimo para quorum)
2. **Replicas múltiplas de 3** (3, 6, 9, 12) para distribuição uniforme
3. **Use topology spread constraints** com `maxSkew: 1`
4. **Configure PDBs** para manter disponibilidade durante falhas
5. **Teste falhas de AZ** regularmente (chaos engineering)


## Estratégias avançadas com Karpenter

### 1. Spot Instances: Maximizando economia

**Por que usar Spot**:

* 70-90% mais barato que On-Demand
* Ideal para workloads stateless
* Karpenter gerencia interrupções automaticamente

**Configuração básica**:

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: spot-optimized
spec:
  template:
    spec:
      requirements:
      # Spot com fallback
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot", "on-demand"]
      
      # Múltiplas categorias (diversificação)
      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c", "m", "r"]
      
      # Múltiplas gerações
      - key: karpenter.k8s.aws/instance-generation
        operator: In
        values: ["5", "6", "7"]
      
      nodeClassRef:
        name: default
  
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 168h  # Renovar semanalmente
```

**Diversificação automática**:

Karpenter escolhe entre dezenas de tipos de instância Spot:

```
Candidatos Spot disponíveis:
- c5.large, c5.xlarge, c5.2xlarge
- c6i.large, c6i.xlarge, c6i.2xlarge
- m5.large, m5.xlarge, m5.2xlarge
- m6i.large, m6i.xlarge, m6i.2xlarge
- r5.large, r5.xlarge
- r6i.large, r6i.xlarge

Karpenter escolhe: c5.xlarge (menor preço no momento)
```

**Tratamento de interrupções**:

```
Spot instance recebe aviso de interrupção (2 min):
    ↓
Karpenter detecta via AWS API
    ↓
Cordona node imediatamente
    ↓
Drena pods (respeitando PDBs)
    ↓
Provisiona novo node (Spot ou On-Demand)
    ↓
Pods são reagendados
    ↓
Total downtime: ~30-60s (com PDBs corretos)
```

**Boa prática para Spot**:

```yaml
# Workloads que toleram Spot
- APIs stateless (com múltiplas réplicas)
- Workers de fila
- Batch jobs
- Ambientes de desenvolvimento

# Workloads que NÃO devem usar Spot
- Bancos de dados
- Caches (Redis, Memcached)
- Workloads stateful
- Single replica críticos
```

**Exemplo: 80% Spot, 20% On-Demand**:

```yaml
# NodePool para workloads gerais (Spot)
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: general-spot
spec:
  template:
    spec:
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot"]
      nodeClassRef:
        name: default
  limits:
    cpu: 400
  weight: 80  # 80% do peso
---
# NodePool para workloads críticos (On-Demand)
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: critical-ondemand
spec:
  template:
    spec:
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["on-demand"]
      taints:
      - key: workload-type
        value: critical
        effect: NoSchedule
      nodeClassRef:
        name: default
  limits:
    cpu: 100
  weight: 20  # 20% do peso
```


### 2. Consolidação inteligente

**Como funciona**:

Karpenter monitora continuamente a utilização dos nodes e consolida quando possível.

**Cenário de consolidação**:

```
Estado inicial:
Node 1 (m5.xlarge): 30% CPU, 40% RAM
Node 2 (m5.xlarge): 25% CPU, 35% RAM
Node 3 (m5.xlarge): 20% CPU, 30% RAM

Karpenter analisa:
"Posso mover todos os pods para 2 nodes m5.xlarge"

Ação:
1. Provisiona Node 4 (m5.xlarge)
2. Move pods de Node 3 para Node 4
3. Termina Node 3
4. Aguarda 15 minutos
5. Consolida Node 1 e Node 2 em Node 5 (m5.2xlarge)
6. Termina Node 1 e Node 2

Estado final:
Node 4 (m5.xlarge): 50% CPU, 60% RAM
Node 5 (m5.2xlarge): 45% CPU, 55% RAM

Economia: 1 node (33%)
```

**Configuração de consolidação**:

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default
spec:
  disruption:
    # Consolidar quando subutilizado
    consolidationPolicy: WhenUnderutilized
    
    # Tempo mínimo antes de consolidar
    consolidateAfter: 30s
```

**Consolidação respeitando PDBs**:

```
Cenário:
- Node 1: api-pod-1, api-pod-2 (PDB: minAvailable=2)
- Node 2: api-pod-3

Karpenter tenta consolidar:
1. Tenta mover api-pod-1 de Node 1
2. PDB permite (ainda tem 2 pods: api-pod-2, api-pod-3)
3. Move api-pod-1 para Node 2
4. Tenta mover api-pod-2 de Node 1
5. PDB bloqueia (só restaria 1 pod: api-pod-3)
6. Karpenter aguarda

PDB respeitado, zero downtime
```

**Monitorando consolidação**:

```bash
# Ver eventos de consolidação
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter | grep consolidation

# Exemplo de log:
# "consolidation delete, terminating 1 nodes"
# "launched node with 1 pods requesting"
```

**Boa prática**:

* Use `consolidationPolicy: WhenUnderutilized` para maximizar economia
* Configure PDBs em todos os deployments críticos
* Monitore eventos de consolidação
* Ajuste `consolidateAfter` se houver muita volatilidade (padrão: 30s)


### 3. Drift: Atualizações automáticas

**O que é drift**:

Drift detecta quando nodes estão desatualizados (AMI antiga, configuração mudou) e os substitui automaticamente.

**Cenário de drift**:

```
Situação:
- Nodes rodando com AMI v1.28.0
- Você atualiza EC2NodeClass para AMI v1.29.0

Karpenter detecta drift:
1. Marca nodes como "drifted"
2. Provisiona novos nodes com AMI v1.29.0
3. Drena pods dos nodes antigos
4. Termina nodes antigos

Resultado: Cluster atualizado sem intervenção manual
```

**Configuração**:

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: default
spec:
  amiFamily: AL2023
  # Quando você muda amiFamily ou amiSelectorTerms,
  # Karpenter detecta drift automaticamente
```

**Forçar drift manualmente**:

```bash
# Adicionar annotation para forçar drift
kubectl annotate nodepool default karpenter.sh/do-not-disrupt=false

# Karpenter vai substituir todos os nodes desse NodePool
```

**Boa prática**:

* Deixe drift habilitado (padrão)
* Use `expireAfter` para renovação periódica
* Teste mudanças em staging primeiro
* Monitore eventos de drift


## Instalando e configurando Karpenter

### Pré-requisitos

1. Cluster EKS (versão 1.23+)
2. IAM roles configuradas
3. VPC com subnets taggeadas
4. Security groups taggeados

### Instalação via Helm

```bash
# 1. Adicionar repositório Helm
helm repo add karpenter https://charts.karpenter.sh
helm repo update

# 2. Criar namespace
kubectl create namespace karpenter

# 3. Instalar Karpenter
helm install karpenter karpenter/karpenter \
  --namespace karpenter \
  --set settings.clusterName=my-cluster \
  --set settings.clusterEndpoint=$(aws eks describe-cluster --name my-cluster --query "cluster.endpoint" --output text) \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=arn:aws:iam::123456789012:role/KarpenterControllerRole \
  --set controller.resources.requests.cpu=1 \
  --set controller.resources.requests.memory=1Gi \
  --set controller.resources.limits.cpu=1 \
  --set controller.resources.limits.memory=1Gi

# 4. Verificar instalação
kubectl get pods -n karpenter
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter
```

### Configuração inicial

**1. Taggear subnets**:

```bash
# Taggear subnets privadas
aws ec2 create-tags \
  --resources subnet-abc123 subnet-def456 \
  --tags Key=karpenter.sh/discovery,Value=my-cluster
```

**2. Taggear security groups**:

```bash
# Taggear security group do cluster
aws ec2 create-tags \
  --resources sg-abc123 \
  --tags Key=karpenter.sh/discovery,Value=my-cluster
```

**3. Criar EC2NodeClass**:

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: default
spec:
  amiFamily: AL2023
  role: KarpenterNodeRole
  subnetSelectorTerms:
  - tags:
      karpenter.sh/discovery: my-cluster
  securityGroupSelectorTerms:
  - tags:
      karpenter.sh/discovery: my-cluster
  blockDeviceMappings:
  - deviceName: /dev/xvda
    ebs:
      volumeSize: 100Gi
      volumeType: gp3
      deleteOnTermination: true
```

**4. Criar NodePool**:

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
      - key: karpenter.k8s.aws/instance-generation
        operator: Gt
        values: ["4"]
      nodeClassRef:
        name: default
  limits:
    cpu: 1000
    memory: 1000Gi
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 720h
```

**5. Aplicar configurações**:

```bash
kubectl apply -f ec2nodeclass.yaml
kubectl apply -f nodepool.yaml
```

**6. Testar provisionamento**:

```bash
# Criar deployment de teste
kubectl create deployment test --image=nginx --replicas=10

# Verificar nodes sendo provisionados
kubectl get nodes -w

# Ver logs do Karpenter
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter -f
```


## Migrando do Cluster Autoscaler para Karpenter

### Estratégia de migração

**Fase 1: Preparação (1-2 semanas)**

1. Auditar workloads:

```bash
# Verificar pods sem resource requests
kubectl get pods -A -o json | \
  jq -r '.items[] | select(.spec.containers[].resources.requests == null) | .metadata.name'

# Verificar deployments sem PDBs
kubectl get deployments -A -o json | \
  jq -r '.items[] | select(.spec.replicas > 1) | .metadata.name'
```

2. Adicionar resource requests:

```yaml
# Antes
containers:
- name: app
  image: app:latest

# Depois
containers:
- name: app
  image: app:latest
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 1000m
      memory: 2Gi
```

3. Criar PDBs:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: app
```

**Fase 2: Instalação (1 dia)**

1. Instalar Karpenter (mantém Cluster Autoscaler)
2. Criar EC2NodeClass e NodePool
3. Testar em namespace isolado

**Fase 3: Migração gradual (1-2 semanas)**

1. Criar NodePool com taint:

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: migration
spec:
  template:
    spec:
      taints:
      - key: karpenter.sh/migration
        value: "true"
        effect: NoSchedule
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot", "on-demand"]
      nodeClassRef:
        name: default
```

2. Migrar workloads por namespace:

```yaml
# Adicionar toleration aos deployments
spec:
  template:
    spec:
      tolerations:
      - key: karpenter.sh/migration
        operator: Equal
        value: "true"
        effect: NoSchedule
```

3. Drenar nodes antigos:

```bash
# Cordon nodes do Cluster Autoscaler
kubectl cordon -l eks.amazonaws.com/nodegroup=old-nodegroup

# Drenar gradualmente
kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data
```

**Fase 4: Finalização (1 dia)**

1. Remover taints do NodePool
2. Deletar node groups antigos
3. Desinstalar Cluster Autoscaler

```bash
# Deletar node groups
aws eks delete-nodegroup \
  --cluster-name my-cluster \
  --nodegroup-name old-nodegroup

# Desinstalar Cluster Autoscaler
kubectl delete deployment cluster-autoscaler -n kube-system
```


## Monitoramento e troubleshooting

### Métricas importantes

**1. Provisionamento de nodes**:

```bash
# Ver eventos de provisionamento
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter | grep "launched node"

# Métricas Prometheus
karpenter_nodes_created_total
karpenter_nodes_terminated_total
karpenter_provisioner_scheduling_duration_seconds
```

**2. Consolidação**:

```bash
# Ver eventos de consolidação
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter | grep consolidation

# Métricas
karpenter_deprovisioning_actions_performed_total
karpenter_deprovisioning_replacement_node_initialized_seconds
```

**3. Utilização de recursos**:

```bash
# Ver utilização de nodes
kubectl top nodes

# Métricas
karpenter_nodes_allocatable{resource="cpu"}
karpenter_nodes_allocatable{resource="memory"}
```

### Troubleshooting comum

**Problema 1: Pods ficam pending**

```bash
# Verificar eventos do pod
kubectl describe pod <pod-name>

# Causas comuns:
# 1. Limits do NodePool atingidos
kubectl get nodepool -o yaml | grep limits

# 2. Requirements muito restritivos
kubectl get nodepool -o yaml | grep requirements

# 3. Taints sem tolerations
kubectl describe pod <pod-name> | grep -A5 Tolerations
```

**Problema 2: Nodes não consolidam**

```bash
# Verificar configuração de consolidação
kubectl get nodepool -o yaml | grep -A5 disruption

# Verificar PDBs bloqueando
kubectl get pdb -A

# Ver logs de consolidação
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter | grep "cannot consolidate"
```

**Problema 3: Spot instances interrompidas frequentemente**

```bash
# Ver histórico de interrupções
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter | grep interruption

# Solução: Aumentar diversificação
# Adicionar mais categorias e gerações ao NodePool
requirements:
- key: karpenter.k8s.aws/instance-category
  operator: In
  values: ["c", "m", "r", "t"]  # Mais opções
- key: karpenter.k8s.aws/instance-generation
  operator: In
  values: ["5", "6", "7"]  # Múltiplas gerações
```

**Problema 4: Custos maiores que esperado**

```bash
# Verificar tipos de instância provisionados
kubectl get nodes -o json | \
  jq -r '.items[] | .metadata.labels["node.kubernetes.io/instance-type"]' | \
  sort | uniq -c

# Verificar capacity type (Spot vs On-Demand)
kubectl get nodes -o json | \
  jq -r '.items[] | .metadata.labels["karpenter.sh/capacity-type"]' | \
  sort | uniq -c

# Solução: Ajustar requirements para instâncias menores
requirements:
- key: karpenter.k8s.aws/instance-size
  operator: In
  values: ["small", "medium", "large"]  # Limitar tamanhos
```


## Melhores práticas: Checklist completo

### Configuração de NodePools

**Diversificação de instâncias**:
```yaml
# Múltiplas categorias
instance-category: ["c", "m", "r"]
# Múltiplas gerações
instance-generation: ["5", "6", "7"]
# Múltiplas arquiteturas (se suportado)
arch: ["amd64", "arm64"]
```

**Limits definidos**:
```yaml
limits:
  cpu: 1000
  memory: 1000Gi
```

**Consolidação habilitada**:
```yaml
disruption:
  consolidationPolicy: WhenUnderutilized
  expireAfter: 720h
```

**Spot com fallback**:
```yaml
capacity-type: ["spot", "on-demand"]
```

### Configuração de Workloads

**Resource requests em todos os pods**:
```yaml
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 1000m
    memory: 2Gi
```

**PDBs para deployments com múltiplas réplicas**:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: app
```

**Topology spread para Multi-AZ**:
```yaml
topologySpreadConstraints:
- maxSkew: 1
  topologyKey: topology.kubernetes.io/zone
  whenUnsatisfiable: DoNotSchedule
```

**Anti-affinity para alta disponibilidade**:
```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        topologyKey: kubernetes.io/hostname
```

### Segurança

**IMDSv2 obrigatório**:
```yaml
metadataOptions:
  httpTokens: required
```

**Discos criptografados**:
```yaml
blockDeviceMappings:
- deviceName: /dev/xvda
  ebs:
    encrypted: true
```

**IAM roles com least privilege**:
* KarpenterControllerRole: Apenas permissões necessárias
* KarpenterNodeRole: Apenas permissões para nodes

### Monitoramento

**Logs centralizados**:
```bash
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter -f
```

**Métricas no Prometheus**:
* karpenter_nodes_created_total
* karpenter_nodes_terminated_total
* karpenter_deprovisioning_actions_performed_total

**Alertas configurados**:
* Pods pending por mais de 5 minutos
* Nodes não consolidando
* Custos acima do esperado

### Custos

**Uso máximo de Spot** (70-90% dos workloads)

**Consolidação habilitada**

**Instâncias Graviton** (ARM64) quando possível

**Monitoramento de custos**:
```bash
# Ver distribuição de capacity type
kubectl get nodes -o json | \
  jq -r '.items[] | .metadata.labels["karpenter.sh/capacity-type"]' | \
  sort | uniq -c
```


## Conclusão

O Karpenter representa uma evolução significativa no auto scaling de Kubernetes. Ao provisionar nodes sob demanda em segundos, escolher automaticamente os melhores tipos de instância, e consolidar recursos continuamente, ele resolve as limitações fundamentais do Cluster Autoscaler.

Os ganhos são concretos:

* **30-60% de redução de custos** através de melhor utilização e Spot instances
* **3-5x mais rápido** no provisionamento de nodes (60-90s vs 3-6 min)
* **2x melhor utilização** de recursos através de consolidação inteligente
* **Simplicidade operacional** com configuração declarativa via NodePools

Mas o Karpenter não é mágico. Ele funciona melhor quando seus workloads seguem boas práticas:

1. **Resource requests corretos**: Karpenter precisa saber o tamanho necessário
2. **PDBs configurados**: Garantem zero downtime durante consolidação
3. **Multi-AZ com topology spread**: Alta disponibilidade automática
4. **Diversificação de instâncias**: Reduz interrupções de Spot

A migração do Cluster Autoscaler para Karpenter deve ser gradual e planejada. Comece auditando seus workloads, adicione resource requests e PDBs, teste em staging, e migre por namespace em produção.

O investimento vale a pena. Empresas que migraram para Karpenter reportam não apenas economia significativa de custos, mas também melhor experiência operacional e maior confiabilidade.

O Karpenter é o presente e futuro do auto scaling no EKS. Quanto antes você migrar, mais cedo começará a economizar.