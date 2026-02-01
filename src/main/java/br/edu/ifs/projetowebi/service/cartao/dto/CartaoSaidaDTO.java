package br.edu.ifs.projetowebi.service.cartao.dto;

import java.math.BigDecimal;

public record CartaoSaidaDTO(
        Long id,
        String nomeCartao,
        BigDecimal multiplicadorPontos,
        String bandeira,
        String nomeUsuario,
        String nomePrograma,
        Long programaId,
        Integer saldoPontos
) {}