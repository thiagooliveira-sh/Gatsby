---
image: /assets/img/AWS.png
title: Criando um Cluster no Amazon EKS
description: "Amazon Elastic Kubernetes Service (EKS) é um serviço gerenciado do
  Kubernetes da Amazon Web Services (AWS) que permite que você execute, gerencie
  e escala facilmente clusters do Kubernetes no AWS. "
date: 2023-01-13
category: aws
background: "#FF9900"
tags:
  - eks
  - k8s
  - aws
categories:
  - eks
  - k8s
  - aws
---
Antes de partirmos para a criação do cluster EKS precisamos dar um paço para tras e entender o que é o Kubernetes e quais pontos o serviço gerenciado veio para resolver. O Kubernetes é um sistema de orquestração de contêineres que permite gerenciar aplicativos em contêineres em um cluster de máquinas. Com o EKS, você pode usar o Kubernetes para gerenciar aplicativos em contêineres no AWS sem precisar instalar e gerenciar manualmente o controlador do Kubernetes.

Usar o EKS tem várias vantagens sobre gerenciar manualmente um cluster do Kubernetes. Algumas das vantagens incluem:

* Facilidade de uso: o EKS cuida de tarefas complexas, como a configuração e o gerenciamento do controlador do Kubernetes, permitindo que você se concentre em desenvolver e executar aplicativos.
* Escalabilidade automática: o EKS gerencia automaticamente a escalabilidade do cluster do Kubernetes, permitindo que você adicione ou remova nós com facilidade.
* Integração com outros serviços do AWS: o EKS se integra com outros serviços do AWS, como o Elastic Load Balancing (ELB) e o Amazon RDS, para fornecer uma solução completa para aplicativos em contêineres.
* Alta disponibilidade: o EKS fornece uma alta disponibilidade do controlador do Kubernetes, permitindo que você execute aplicativos críticos de negócios de forma confiável.

Em resumo, EKS é um serviço da AWS que facilita a criação, configuração e escalabilidade de cluster Kubernetes de forma segura e simples. Isso permite que as equipes de DevOps ou o desenvolvedor possam se concentrar em suas aplicações, enquanto a AWS cuida das preocupações de infraestrutura do cluster.

Sabendo disso vamos então passar pelos seguintes pontos para conseguirmos criar o nosso cluster e subir a nossa primeira aplicação de teste:

* Cluster IAM Role
* Criar EKS Cluster
* Atualizar kubeconfig
* SSM Daemonset
* Node IAM Role
* Criar Node Group
* Deploy Sample App

## Cluster IAM Role

Vamos primeiro criar a Role adicionando uma relação de confiança através do trust relationships. Vamos a partir dai determinar que o serviço AWS podem assumir essa Role, por se tratar do Cluster EKS, a politica seguirá conforme declarado abaixo, basta que execute o seguinte comando para criar um arquivo JSON de política de confiança do IAM:

```
cat >eks-cluster-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
```

Com o arquivo JSON criado, vamos agora criar a função de permissão (Role) usando o AWS CLI.

```
aws iam create-role --role-name EksClusterRole --assume-role-policy-document file://"eks-cluster-trust-policy.json"
```

Com a função criada, vamos anexar a política que determinará quais permissões o cluster poderá assumir.

```
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy --role-name EksClusterRole
```

# Criar EKS Cluster

Temos várias opções diferentes para criar um cluster, como o EKSCTL e o AWS CLI, mas para obter uma visão mais completa do processo de criação, vamos utilizar o console da Amazon. Para criar um cluster EKS, acesse o link do console da [Amazon EKS](https://console.aws.amazon.com/eks/home#/clusters).

Escolha Add cluster e, em seguida, Create.

\[﻿eks-01]

V﻿amos preencher algumas informações na primeira tela de configuração, precisamos preencher os campos de Name, Kubernetes Versions, Cluster Service Role, Secrets encryption ( Opcional ) e Tags, feito isso podemos avançar para a próxima tela de configuração.

\[﻿eks-02]

Na página Specify networking vamos precisar inserir as informações de VPC, Subnets, Security Groups (Opcional), IP address family e o tipo de Endpoint, para o nosso laboratório vamos seguir com o endpoint Público.

\[﻿eks-03]

V﻿amos pular a parte de configuração de logs, uma vez que esse é apenas um laboratório, mas lembre-se que podemos habilitar os seguintes logs do control plane:

﻿ *API server*
﻿ Audit
*﻿ Authenticator

* Controller manager
* Scheduler

Todos os logs ficam disponíveis através do CloudWatch, podendo ser consumido diretamente pelo console da AWS ou utilizando alguma outra ferramenta como por exemplo o AWS Opensearch.

Por fim, basta confirmar as próximas telas, onde serão apresentados os plugins que são instalados por padrão no cluster. Em seguida, será necessário revisar e confirmar para iniciar a criação do cluster.

# Atualizar kubeconfig

Com o nosso cluster criado, podemos testar o acesso ao endpoint do API Service do nosso cluster fazendo a atualização do contexto do `kubeconfig` através do seguinte comando no AWS cli.

```
aws eks update-kubeconfig --region us-east-2 --name my-eks-lab-cluster
```

Obtendo sucesso, passamos a ter acesso dentro do cluster e podemos realizar chamadas com o `kubectl` como o do exemplo abaixo:

[﻿eks-get-cm-01]

# SSM Daemonset

No  EKS, devido à uma serie de diretrizes de segurança, quando trabalhamos com Managed Node Groups os Nodes possuem apenas uma chave SSH anexadas a eles, definida no momento da criação dos Grupos. 

Para isso vamos utilizar o DaemonSet do Kubernetes para instalar o SSM Agent em todos os Nodes  que vierem a fazer parte do nosso Cluster, em vez de instalá-lo manualmente ou substituir a AMI o DaemonSet usa um CronJob no Node para programar a instalação do SSM Agent. 

Copie o texto abaixo para criar o manifesto necessário para aplicarmos no nosso Cluster:

```
cat << EOF > ssm_daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    k8s-app: ssm-installer
  name: ssm-installer
  namespace: kube-system
spec:
  selector:
    matchLabels:
      k8s-app: ssm-installer
  template:
    metadata:
      labels:
        k8s-app: ssm-installer
    spec:
      containers:
      - name: sleeper
        image: busybox
        command: ['sh', '-c', 'echo I keep things running! && sleep 3600']
      initContainers:
      - image: amazonlinux
        imagePullPolicy: Always
        name: ssm
        command: ["/bin/bash"]
        args: ["-c","echo '* * * * * root yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm & rm -rf /etc/cron.d/ssmstart' > /etc/cron.d/ssmstart"]
        securityContext:
          allowPrivilegeEscalation: true
        volumeMounts:
        - mountPath: /etc/cron.d
          name: cronfile
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
      volumes:
      - name: cronfile
        hostPath:
          path: /etc/cron.d
          type: Directory
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      schedulerName: default-scheduler
      terminationGracePeriodSeconds: 30
EOF
```

P﻿ara aplicar, basta utilizar o comando do `kubectl`:

```
k﻿ubectl apply -f ssm_daemonset.yaml
```

# Node IAM Role

Assim como necessário para o Cluster, precisamos criar uma Role especifica para utilização do nosso Node Group, e para isso existe um padrão simples de IAM Role, assim como para o Cluster vamos precisar criar uma politica adicionando uma relação de confiança através do trust relationships:

```
cat >node-trust-relationship.json <<EOF
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
```

Com o arquivo JSON criado, vamos agora criar a função de permissão (Role) usando o AWS CLI.

```
aws iam create-role \
  --role-name EKSNodeRole \
  --assume-role-policy-document file://"node-trust-relationship.json"
```

Criada a função, vamos anexar a política que determinará quais permissões o Node poderá assumir:

```
aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy \
  --role-name EKSNodeRole
aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly \
  --role-name EKSNodeRole
aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy \
  --role-name EKSNodeRole
aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM \
  --role-name EKSNodeRole
```

# Criar Node Group

Para adicionar um grupo de nós ao nosso cluster, basta acessar o console da AWS e clicar no nome do cluster recém criado.  Nessa tela encontraremos informações relevantes sobre o cluster e uma aba chamada `compute` destinado a criação e gerenciamento dos Node Groups:

[﻿eks-04]

Para adicionar o Node, basta clicar em add node group e então iniciaremos o wizard para criação do recurso. Inicialmente precisamos preencher as seguintes informações, Nome, Node IAM role e Tags, as demais informações são opcionais como Kubernetes labels, Kubernetes taints. Como vamos utilizar Managed Nodes vamos ignorar a configuração de Launch Templates.

[﻿eks-05]

Na próxima tela, vamos determinar a parte computacional, então vamos escolher a familia das instancias EC2 e as configurações de scaling. Essa fica em aberto não existe uma configuração correta, vai depender da sua necessidade, por se tratar de um lab podemos seguir com apenas uma maquina t3a.medium:

[﻿eks-06]

Ainda nessa tela temos uma configuração muito importante para o Node Group que é a configurar o máximo de nodes que podem ficar indisponíveis ou que podem ser tolerados para realizarmos uma atualização no Node Group.

[﻿eks-07]

Na ultima tela temos a definição de rede, onde será possível definir quais subnets vão ser utilizadas, um ponto de atenção é que para subnets publicas é obrigatório que as subnets disponibilizem IPs públicos para as instancias por padrão.



# Deploy Sample App

Bom, nessa altura do campeonato devemos estar com o Cluster EKS criado e com o Node disponível, para realizar um teste vamos subir um `pod` simples, composto por um deployment e um service responsáveis por subir um Nginx na namespace `eks-sample-app`. Primeiro precisamos criar a namespace:

```
kubectl create namespace eks-sample-app
```

P﻿ara criamos o Nginx, rode o comando abaixo na sua máquina para criar o arquivo de deployment:

```
cat << EOF > eks-sample-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eks-sample-linux-deployment
  namespace: eks-sample-app
  labels:
    app: eks-sample-linux-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: eks-sample-linux-app
  template:
    metadata:
      labels:
        app: eks-sample-linux-app
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: kubernetes.io/arch
                operator: In
                values:
                - amd64
                - arm64
      containers:
      - name: nginx
        image: public.ecr.aws/nginx/nginx:1.21
        ports:
        - name: http
          containerPort: 80
        imagePullPolicy: IfNotPresent
      nodeSelector:
        kubernetes.io/os: linux
EOF
```

Arquivo criado, basta que apliquemos no cluster:

```
kubectl create -f eks-sample-app.yaml
```

Um `service` permite acessar todas as réplicas através de um único endereço IP ou nome, então para isso rode o comando abaixo na sua máquina para criar o arquivo yaml:

```
cat << EOF > eks-sample-app-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: eks-sample-linux-service
  namespace: eks-sample-app
  labels:
    app: eks-sample-linux-app
spec:
  selector:
    app: eks-sample-linux-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
EOF
```

﻿Assim como o deployment, basta aplicar no Cluster com o `kubectl`:

```
kubectl create -f eks-sample-linux-service.yaml
```

V﻿amos utilizar o seguinte comando para retornar todo o conteúdo criado na namespace:

```
kubectl get all -n eks-sample-app
```

[﻿eks-get-all]

Com tudo funcionando, podemos testar o acesso ao nosso `Nginx` através do port-foward, sendo possível acessar o `service` criado utilizando a infraestrutura do cluster, para isso basta executar o comando abaixo e acessar no seu navegador através do `http://localhost:8080`:

```
kubectl port-forward svc/eks-sample-linux-service 8080:80 -n eks-sample-app
```

[﻿eks-port-foward]

# Considerações finais

Espero que tenham aproveitado o lab e que os pontos principais referente a criação e funcionamento do EKS tenha sido explanado de forma simples, até a próxima!


































