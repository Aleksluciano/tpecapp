using {TPEService} from './tpeservice';

annotate TPEService.Users with {
    name         @title: 'Publicador';
    gender       @title: 'Sexo';
    birth_date   @title: 'Data de Nascimento';
    lastime      @title: 'Última designação(AAAAMMDD)';
    desativado   @title: 'Desativado';
    seg          @title: 'Seg';
    ter          @title: 'Ter';
    qua          @title: 'Qua';
    qui          @title: 'Qui';
    sex          @title: 'Sex';
    sab          @title: 'Sab';
    dom          @title: 'Dom';
    age          @title: 'Idade';
    lastdayCount @title: 'Últ. desig.';
    email        @title: 'E-mail';
    phone        @title: 'Telefone (XX) XXXXX-XXXX';
    whatsapp     @title: 'Whatsapp';
    partner      @title: 'Companheiro fixo';
    statusText   @title: 'St.';

};

annotate TPEService.Points with {
    name     @title: 'Ponto';
    capacity @title: 'Capacidade';
    descr    @title: 'Descrição';
}

annotate TPEService.Periods with {
    name  @title: 'Perído';
    descr @title: 'Descrição';
}

annotate TPEService.DaysOfWeek with {
    code @title: 'Código';
    day  @title: 'Dia';
}

annotate TPEService.Week with {
    nameweek   @title: 'Dia Semana';
    point      @title: 'Ponto';
    period     @title: 'Período';
    specialDay @title: 'Dia especial';
}

annotate TPEService.Schedule with {
    name  @title: 'Escala E';
    begin @title: 'Início';
    end   @title: 'Fim';

}

annotate TPEService.Report with {
    schedule @title: 'Escala R';
    day      @title: 'Dia';
    dayweek  @title: 'Dia semana';
    point    @title: 'Ponto';
    period   @title: 'Período';
    user     @title: 'Publicador';

}

annotate TPEService.Gender with {
    code @title: 'Código';
    sexo @title: 'Sexo';

}
