---
image: /assets/img/ansible-logo.png
title: Ansible Primeiros passos
description: O Ansible é uma ferramenta de automação de código aberto usada para
  configurar servidores, instalar software e executar uma grande variedade de
  tarefas de TI a partir de uma localização central.
date: 2021-02-05
category: devops
background: "#05A6F0"
tags:
  - Ansible
  - Devops
categories:
  - Ansible
  - Devops
---
Embora voltado para administradores de sistema com acesso privilegiado que rotineiramente executam tarefas como instalar e configurar aplicativos, o Ansible também pode ser usado por usuários não privilegiados. Por exemplo, um administrador de banco de dados que usa o ID de login do mysql pode usar o Ansible para criar bancos de dados, adicionar usuários e definir controles de nível de acesso.

Antes de começarmos, é necessário que tenha o Ansible instalado na sua máquina ou na máquina que utilizará para executar os seus playbooks, dessa forma você poderá seguir o processo de instalação através do [site oficial](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) de acordo com o seu sistema operacional. 

Além disso, é necessário que tenha acesso ssh as máquinas de destino para que o ansible realize as suas configurações, se não definido uma chave SSH ele utilizará a chave padrão do seu usuário.

### Estrutura
Dentro de um projeto Ansible podemos falar que teremos um formato de estrutura padrão a ser seguido, observe:

````
├── hosts
├── main.yml
├── roles
└── vars
````

O arquivo `hosts` será um arquivo servirá como inventário, podemos separar as máquinas por grupos para que granulação da aplicação das regras, por exemplo:

````
[app1]
192.168.0.3

[app2]
192.168.0.4
````

Dessa forma, populamos o nosso arquivo de inventário com os grupos `app1` e `app2` especificando qual o endereço das máquinas targets. Os diretórios `vars` e roles` servirão para armazenar as variáveis do projeto e os passos que serão aplicados, respectivamente.

O arquivo `main.yml` faremos a estruturação do projeto e chamada das ações definidas através das roles.

### Comandos

Com a instalação do Ansible, nos deparamos alguns comandos que podem ser utilizados, vamos abordar apenas alguns que julgo mais importante, tendo em vista que vamos iniciar no conteúdo hoje.
 
#### ansible

O comando `ansible` pode ser utilizado para executar alguns playbooks mais simples a nível de comando, sendo possível a execução com alguns módulos. O mais simples, é o módulo ping, para testar a comunicação com as maquinas de destino:

````
ansible -i hosts all -m ping
````

Podemos também utilizar qualquer outro módulo, por exemplo o módulo shell para executarmos algum comando na máquina remota ou coletar alguma informação:

````
ansible -i hosts all -m shell -a "uptime"
````

#### ansible-galaxy

Podemos utilizar o ansible-galaxy para realizar a criação da estrutura das nossas roles, geralmente utilizamos esse comando dentro do diretório que armazenará a role:

````
ansible-galexy init role_name
````


#### ansible-playbook

Responsável pela execução dos playbooks mais complexos, executando todas roles configuradas, temos o comando ansible playbook que após estruturado todo o projeto basta executa-lo passando como parâmetro o arquivo de inventário e o main.yml, observe:

````
ansibe-playbook -i hosts main.yaml
````

#### ansible-vault 
encryption/decryption utility for Ansible data files


### Primeiro Playbook

Vamos criar o nosso primeiro playbook, vamos defnir da seguinte forma, criaremos uma role para instalação de alguns pacotes em ambas as máquinas e em seguida enviaremos um script apenas para as máquinas do grupo `app2`. 

Dessa forma, vamos criar as nossas roles utilizando o ansible-galay, certifique-se de que a sua estrutura de arquivos já encontra-se semelhante ao que temos abaixo:

````
├── hosts
├── main.yml
├── roles
└── vars
    └── vars.yml
````

Feito isso, acesse o diretório de roles e crie duas roles, da seguinte forma:

````
ansible-galexy init install-basics
ansible-galexy init import-files
````

Feito isso, o Ansible irá criar toda a estrutura de roles padrão, nesse ambiente utilizaremos apenas os diretórios de `tasks` e `files` os demais podem ser removidos, ficando dessa forma:

````
├── import-files
│   ├── files
│   ├── README.md
│   ├── tasks
│   │   └── main.yml
└── install-basics
    ├── files
    ├── README.md
    ├── tasks
    └──  └── main.yml
````


### Execução

````
ansible-playbook -i hosts main.yaml
````