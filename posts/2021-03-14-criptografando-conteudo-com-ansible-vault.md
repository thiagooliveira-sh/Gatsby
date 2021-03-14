---
image: /assets/img/ansible-logo.png
title: " Criptografando conteudo com Ansible Vault"
description: O Ansible Vault criptografa variáveis ​​e arquivos para que você
  possa proteger conteúdo confidencial, como senhas ou chaves, em vez de
  deixá-los disponíveis nas duas tasks..
date: 2021-03-14
category: devops
background: "#05A6F0"
tags:
  - Linux
  - Ansible
  - Devops
categories:
  - Linux
  - Ansible
  - Devops
---
Para usar o Ansible Vault, você precisa de uma ou mais senhas para criptografar e descriptografar o conteúdo. Se você armazenar suas senhas do vault em uma ferramenta de terceiros, como um secret manager, precisará de um script para acessá-las. Use as senhas com a ferramenta de linha de comando ansible-vault para criar e visualizar variáveis ​​criptografadas, criar arquivos criptografados, criptografar arquivos existentes ou editar, redigitar ou descriptografar arquivos.