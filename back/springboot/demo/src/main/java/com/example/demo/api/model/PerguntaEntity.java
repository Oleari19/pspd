package com.example.demo.api.model;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "TB_PERGUNTA")
public class PerguntaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo_PERGUNTA", nullable = false, updatable = false)
    private Integer codigoPergunta;

    @Column(name = "PERGUNTA", nullable = false, length = 500)
    private String pergunta;

    @Column(name = "Q1", nullable = false, length = 500)
    private String q1;

    @Column(name = "Q2", nullable = false, length = 500)
    private String q2;

    @Column(name = "Q3", nullable = false, length = 500)
    private String q3;

    @Column(name = "Q4", nullable = false, length = 500)
    private String q4;

    @Column(name = "EXPLICACAO", nullable = false, length = 500)
    private String explicacao;

    @Column(name = "INDICE_RESPOSTA", nullable = false)
    private Integer indiceResposta;

}

