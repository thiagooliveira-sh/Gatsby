---
image: /assets/img/Zabbix.png
title: Configuracao Zabbix Server com Grafana
description: >-
  Aprenda como instalar e configurar um servidor Zabbix e realizar a integração
  com o Grafana
date: '2020-02-19'
category: linux
background: '#EE0000'
tags:
  - Zabbix
  - Grafana
  - Monitoramento
  - Linux
  - CentOs
---
O Zabbix é uma excelente ferramenta de monitoramento que coleta dados de servidores, máquinas virtuais e outros tipos de dispositivos de rede, alertando sempre que um problema for identificado. Possui também notificações ricas em recursos sobre problemas emergentes, apesar de ser uma ferramenta poderosa quando se fala em software de monitoramento de ativos de rede, o mesmo ainda carece de dashboards mais amigáveis e com isso temos o Grafana, que é um plugin que consome a API do Zabbix e realiza a criação de diversos dashboards e gráficos de forma muito mais simplificada.

Nesse artigo iremos configurar e instalar o Zabbix server em um servidor CentOs7 e posteriormente será feito a sua integração com o Grafana, no qual realizaremos algumas configurações com as informações monitoradas a partir do Zabbix server.
