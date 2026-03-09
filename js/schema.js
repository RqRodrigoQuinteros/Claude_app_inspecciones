
// schema.js — Definición completa del formulario por tipología

export const TIPOLOGIAS = [
  { v: "CLINICA",                  l: "Clínica" },
  { v: "QUIRURGICOS",              l: "Quirúrgicos" },
  { v: "OPTICAS",                  l: "Ópticas" },
  { v: "CENTROSAMBULATORIOS",      l: "Centros Ambulatorios" },
  { v: "ESTETICA/ONCOLOGICOS",     l: "Estética / Oncológicos" },
  { v: "ODOONTOLOGICOS",           l: "Odontológicos" },
  { v: "CONSULTORIOS",             l: "Consultorios" },
  { v: "EMERGENCIA",               l: "Emergencia" },
  { v: "TRASLADOS",                l: "Traslados" },
  { v: "TATOO",                    l: "Tatoo" },
  { v: "FERTILIDADREPRODUCCION",   l: "Fertilidad y Reproducción" },
  { v: "EXTRAHOSPITALARIOS",       l: "Extrahospitalarios" },
  { v: "INTERNACION DOMICILIARIA", l: "Internación Domiciliaria" },
];

// Helpers para definir campos
const yn   = (id, label) => ({ id, label, t: "yn" });       // SI / NO botones
const ync  = (id, label) => ({ id, label, t: "ync" });      // SI / NO con borde punteado (activa anexo)
const txt  = (id, label) => ({ id, label, t: "text" });
const num  = (id, label) => ({ id, label, t: "num" });
const date = (id, label) => ({ id, label, t: "date" });
const area = (id, label) => ({ id, label, t: "area" });

// ── Secciones comunes (todas las tipologías) ──────────────
const S_GENERAL = { id: "general", titulo: "Datos Generales", campos: [
  txt("NRO_EXPEDIENTE",            "N° Expediente"),
  txt("NOMBRE_ESTABLECIMIENTO",    "Establecimiento"),
  txt("RAZON_SOCIAL",              "Razón Social"),
  txt("DIRECCION_ESTABLECIMIENTO", "Dirección"),
  txt("LOCALIDAD_ESTABLECIMIENTO", "Localidad"),
  txt("EMAIL",                     "Email"),
  num("TELEFONO",                  "Teléfono"),
  num("DIA",  "Día"), num("MES", "Mes"), num("ANIO", "Año"),
  txt("HORA",                      "Hora"),
  yn("INS_V",           "Inspección Virtual"),
  yn("INS_P",           "Inspección Presencial"),
  yn("TIPO_INS_HAB",    "Tipo: Habilitación"),
  yn("TIPO_INS_RUT",    "Tipo: Rutina"),
  yn("TIPO_INS_DEN",    "Tipo: Denuncia"),
  date("FECHA_HAB",     "Fecha Habilitación"),
  txt("RESOLUCION",     "Resolución N°"),
]};

const S_DIRECTOR = { id: "director", titulo: "Director Técnico", campos: [
  txt("DIRECTOR_TECNICO", "Nombre"),
  num("DNI_DT",           "DNI"),
  txt("MATRICULA_DT",     "Matrícula"),
  ync("DT_COND",          "Presente (activa anexo DT)"),
]};

const S_REGISTROS = { id: "registros", titulo: "Registros y Revisión", campos: [
  txt("REG_HIS_CLI", "Registro Historia Clínica"),
  txt("TIPO",        "Tipo"),
  yn("REV_HC",       "Revisión HC"),
  num("COMP",        "Completas"),
  num("INCOMP",      "Incompletas"),
  yn("RI_MC",        "Reglamento Interno"),
  yn("AD_PRIV",      "Aditamento Privado"),
]};

const S_OBS = { id: "obs", titulo: "Observaciones", campos: [
  area("OBSERVACIONES", "Observaciones generales"),
]};

// ── CLÍNICA ───────────────────────────────────────────────
const CLINICA = [
  { id: "edif", titulo: "Datos del Establecimiento", campos: [
    num("CANT_PL",     "N° Plantas"),
    yn("PL_EV_VI",     "Plan Evacuación Vigente"),
    yn("EX_INC",       "Extinguidores"),
    yn("POS_MON_ASC",  "Ascensores / Montacargas"),
    yn("SAL_EME",      "Salida de Emergencia"),
    yn("BANIO_DIS",    "Baño para Discapacitados"),
    yn("HAB_BOMB",     "Habilitación Bomberos"),
    yn("LUC_AUT",      "Luces Autónomas"),
    yn("EQUI_ELE",     "Grupo Electrógeno"),
  ]},
  { id: "consultorios_ext", titulo: "Consultorios Externos", campos: [
    yn("CONS_EXT",  "Posee Consultorios Externos"),
    num("CANT_TOT", "Cantidad Total"),
    num("CAN_CONS", "Cantidad Conforme"),
    yn("CONS_LAV",  "Con Lavabo"),
  ]},
  { id: "inst_posee", titulo: "La Institución Posee", campos: [
    yn("VAC_HAB",           "Vacunatorio"),
    yn("BOT_DRO_URG",       "Botiquín de Urgencia"),
    yn("FAR_PROV",          "Farmacia Propia"),
    yn("BCO_SAN",           "Banco de Sangre"),
    ync("LAB_COND",         "Laboratorio"),
    ync("HEMOTERAPIA_COND", "Hemoterapia"),
    ync("HEMODIALISIS_COND","Hemodiálisis"),
    ync("RADIO_COND",       "Radiofísica"),
  ]},
  { id: "radio", titulo: "Radiofísica", campos: [
    yn("DIA_IMA_HAB", "Diagnóstico por Imagen"),
    yn("MAM_HAB",     "Mamografía"),
    yn("DEN_OS",      "Densitometría"),
    yn("PET",         "PET"),
    yn("TAC",         "TAC"),
    yn("RMN",         "RMN"),
    yn("RAD_SIM_HAB", "Radiología Simple"),
    yn("RAD_CON_HAB", "Radiología Contrastada"),
    yn("ECO_HAB",     "Ecografía"),
  ]},
  { id: "intern", titulo: "Internación — N° de Camas", campos: [
    num("H1_CON",    "Hab. Simple Conforme"),
    num("H2_CON",    "Hab. Doble Conforme"),
    num("H3_CON",    "Hab. Múltiple Conforme"),
    num("H1_INC",    "Hab. Simple Incompleta"),
    num("H2_INC",    "Hab. Doble Incompleta"),
    num("H3_INC",    "Hab. Múltiple Incompleta"),
    num("OTR",       "Otras"),
    num("TOT_HABIT", "Total Camas"),
    num("CAM_ORT_NRO","Camas Ortopédicas"),
    yn("LLAM_BANIO", "Llamador de Baño"),
  ]},
  { id: "deposito", titulo: "Depósito de Cadáveres", campos: [
    yn("LOC_DEP",     "Local Propio"),
    yn("PER_VENT",    "Perfecta Ventilación"),
    yn("UBI_ARE_SER", "En Área de Servicios"),
  ]},
  { id: "ambientes", titulo: "Ambientes de Internación", campos: [
    yn("ILU_NAT",     "Iluminación Natural"),
    yn("VENT_NATU",   "Ventilación Natural"),
    yn("CLI_FRI_CAL", "Climatización Frío/Calor"),
    yn("ILU_ART_CEN", "Ilum. Artificial Central"),
    yn("ILU_ART_IND", "Ilum. Artificial Individual"),
    yn("LLAM_IND",    "Llamador Individual"),
    yn("PRIV",        "Privacidad"),
  ]},
  { id: "enfermeria", titulo: "Enfermería", campos: [
    yn("LOC_PROP", "Local Propio"),
    yn("BOT_URG",  "Botiquín de Urgencia"),
    yn("TUB_OXI",  "Tubos de Oxígeno"),
    yn("MES_PIL",  "Mesa de Piletón"),
    yn("ARM_VIT",  "Armario Vitrina"),
    yn("AR_SUC",   "Área Sucia"),
    yn("AR_LIM",   "Área Limpia"),
  ]},
  { id: "quirurgica", titulo: "Área Quirúrgica", campos: [
    num("CANT_QUIR",   "Cantidad de Quirófanos"),
    yn("C_N_PAR",      "Conforme — Paredes"),
    yn("C_N_PIS",      "Conforme — Pisos"),
    yn("C_N_TEC",      "Conforme — Techos"),
    yn("CIR_EXC",      "Circulación Exclusiva"),
    yn("IN_TR_PAC",    "Ingreso/Traslado Pacientes"),
    yn("VES_PROP",     "Vestuario Propio"),
    yn("AC_COMP_PRE",  "Aire Comprimido / Presión"),
    yn("CARD",         "Cardiógrafo"),
    yn("BOT_ANES",     "Botiquín Anestesia"),
    yn("BOT_REA",      "Botiquín Reanimación"),
    yn("MON_MULTI",    "Monitor Multiparamétrico"),
    yn("RES_AUTO",     "Respirador Automático"),
    yn("ELEC",         "Electrocardiógrafo"),
  ]},
  { id: "guardia", titulo: "Guardia", campos: [
    yn("C_E_GUARDIA",        "Condiciones Edilicias"),
    yn("P_GUARDIA",          "Planos"),
    num("MEDICOS_GUARDIA",   "N° Médicos de Guardia"),
    num("ENFERMERAS_GUARDIA","N° Enfermeras de Guardia"),
    yn("CARDI_GUARDIA",      "Cardiógrafo en Guardia"),
    yn("ELEC_GUARDIA",       "Electrobisturí en Guardia"),
    yn("M_M_GUARDIA",        "Mesas de Mayo"),
  ]},
  { id: "uti_uco", titulo: "UTI / UCO / UTIN / Hemodinamia", campos: [
    ync("UTI_COND",     "UTI"),
    ync("UCO_COND",     "UCO"),
    ync("UTI_NEO_COND", "UTIN / UTIP"),
    ync("HEMODINA_COND","Hemodinamia"),
  ]},
  { id: "obstetricia", titulo: "Obstetricia", campos: [
    yn("SAL_PAR",      "Sala de Partos"),
    yn("SAL_REC",      "Sala de Recuperación"),
    yn("REC_RECNAC",   "Recepción Recién Nacido"),
    num("CANT_SAL_PAR","Cantidad Salas de Parto"),
    yn("C_NORMAS_PAR", "Conforme Normas — Paredes"),
    yn("C_NORMAS_PIS", "Conforme Normas — Pisos"),
    yn("C_NORMAS_TEC", "Conforme Normas — Techos"),
    yn("CIRC_EXCL",    "Circulación Exclusiva"),
  ]},
  { id: "laboratorio", titulo: "Laboratorio", campos: [
    yn("HAB_COB", "Habilitado / Con Convenio"),
  ]},
];

// ── QUIRÚRGICOS ───────────────────────────────────────────
const QUIRURGICOS = [
  { id: "insc", titulo: "Inscripción y Habilitación", campos: [
    ync("QUIR_COND",      "Posee Quirófanos"),
    num("NRO_CAMAS_QUIR", "N° de Camas"),
    yn("PLAN_QUIR",       "Planos"),
    txt("TISOC_QUIR",     "Tipo de Sociedad"),
    yn("ADPRIV_QUIR",     "Aditamento Privado"),
    yn("DIRLIS_QUIR",     "Directorio / Listado Prof."),
    yn("NOPRAC_QUIR",     "Nómina Prácticas"),
    yn("CONEST_QUIR",     "Convenio Esterilización"),
    yn("CONSEREME_QUIR",  "Convenio Serv. Emergencia"),
    yn("CONSERTRAS_QUIR", "Convenio Traslado"),
    yn("ORGFUNC_QUIR",    "Organigrama Funcional"),
  ]},
  { id: "enf_q", titulo: "Enfermería", campos: [
    yn("LOCPROP_QUIR", "Local Propio"),
    yn("TUBOX_QUIR",   "Tubos de Oxígeno"),
    yn("ESTE_QUIR",    "Esterilización"),
    yn("BOTURG_QUIR",  "Botiquín de Urgencia"),
  ]},
  { id: "int_q", titulo: "Área de Internación", campos: [
    yn("HABREC_QUIR",  "Hab. de Recuperación"),
    yn("POBAN_QUIR",   "Posee Baño"),
    num("CAN_QUIR",    "Cantidad Camas"),
    yn("VENNAT_QUIR",  "Ventilación Natural"),
    yn("TUOXIG_QUIR",  "Tubos de Oxígeno"),
    yn("PRIVA_QUIR",   "Privacidad"),
  ]},
  { id: "eq_q", titulo: "Equipamiento Quirúrgico", campos: [
    yn("BOTBAS_QUIR",  "Botiquín Básico"),
    yn("LARITUB_QUIR", "Laringoscopio / Tubo Endo."),
    yn("MON_QUIR",     "Monitor"),
    yn("ELECTRO_QUIR", "Electrobisturí"),
    yn("OXIPUL_QUIR",  "Oxímetro de Pulso"),
    yn("RESAUTO_QUIR", "Respirador Automático"),
    yn("CARDI_QUIR",   "Cardiógrafo"),
  ]},
  { id: "ester_q", titulo: "Esterilización", campos: [
    yn("AUTOCL_QUIR",     "Autoclave"),
    yn("CONEMPAUTO_QUIR", "Con Empresa Autorizada"),
    yn("MATDES_QUIR",     "Material Descartable"),
  ]},
];

// ── ÓPTICAS ───────────────────────────────────────────────
const OPTICAS = [
  { id: "loc_opt", titulo: "Local — Artículos Normativa", campos: [
    ync("OPT_COND",   "Posee Sección Óptica"),
    yn("ART11",       "Art. 11"),
    yn("ART7",        "Art. 7"),
    yn("LIBREC",      "Libro de Recetas"),
    yn("ILAD_LOC",    "Iluminación Adecuada"),
    yn("ART12_ANEXO", "Art. 12 — Anexo"),
    yn("DIPLO_EXHI",  "Diploma Exhibido"),
    yn("MOSTR",       "Mostrador"),
    yn("MUE_COL",     "Muestrario Colores"),
  ]},
  { id: "tal_opt", titulo: "Taller (Art. 8)", campos: [
    yn("FRONTO",    "Frontofocómetro"),
    yn("ESFERO",    "Esferómetro"),
    yn("PIN_ADAP",  "Pinzas Adaptadoras"),
    yn("BAN_OPT",   "Baño Óptico"),
    yn("MA_BISE",   "Máquina Biselar"),
    yn("STOCK_CRIS","Stock de Cristales"),
  ]},
  { id: "cont_opt", titulo: "Gabinete de Contactología", campos: [
    yn("SAL_DE_ESP", "Sala de Espera"),
    yn("FRONTOFO",   "Frontofocómetro"),
    yn("LA_LUZ_NE",  "Lámpara de Luz Negra"),
    yn("LUPA4",      "Lupa 4x"),
    yn("OPTOTI",     "Optotipo"),
    yn("LEN_CONT",   "Stock Lentes de Contacto"),
    yn("OFTALMO",    "Oftalmoscopio"),
    yn("LAVABO",     "Lavabo"),
  ]},
];

// ── CENTROS AMBULATORIOS ──────────────────────────────────
const CENTROS_AMB = [
  { id: "hab_ca", titulo: "Habilitación y Documentación", campos: [
    ync("CENAMB_COND",  "Centro Ambulatorio"),
    yn("FORM",          "Formulario Habilitación"),
    yn("AD_PRIVAD",     "Aditamento Privado"),
    yn("CER_AUTO_LAB",  "Cert. Autorización Lab."),
    yn("CONV_EST",      "Convenio Esterilización"),
    yn("ORG_FUNC",      "Organigrama Funcional"),
    txt("TIP_SOCIE",    "Tipo de Sociedad"),
    yn("DIR_LIS_PROF",  "Directorio Profesionales"),
    yn("CER_RAYX",      "Cert. Rayos X"),
    yn("CER_HAB_HEM",   "Cert. Hab. Hemoterapia"),
  ]},
  { id: "func_ca", titulo: "Dirección y Funcionamiento", campos: [
    num("NRO_PLANTAS",      "N° Plantas"),
    yn("ASC_MONTA",         "Ascensor / Montacargas"),
    yn("SALI_EME",          "Salida de Emergencia"),
    yn("REG_HISCLI",        "Reg. Historia Clínica"),
    yn("PLAN_EVAC",         "Plan de Evacuación"),
    num("NRO_CONSULTORIOS", "N° Consultorios"),
    yn("BAN_DISCA",         "Baño para Discapacitados"),
    yn("EST_AUTOC",         "Esterilización / Autoclave"),
    yn("MAT_DESC",          "Material Descartable"),
  ]},
];

// ── ESTÉTICA / ONCOLÓGICOS ────────────────────────────────
const ESTETICA = [
  { id: "hab_est", titulo: "Habilitación y Certificados", campos: [
    ync("ES_ONC_COND",  "Sección Estética / Oncológico"),
    num("NRO_CAM_REC",  "N° Camas / Reclinatorios"),
    txt("TI_SOC",       "Tipo de Sociedad"),
    yn("CER_AU_LAB",    "Cert. Autorización Lab."),
    yn("CER_HAB_HEMO",  "Cert. Hab. Hemoterapia"),
    yn("CONV_SERV",     "Convenio de Servicios"),
    yn("ORG_FUNC",      "Organigrama Funcional"),
    yn("HAB_IN_EQ",     "Hab. Internación Equipada"),
    yn("CON_POLIV",     "Consultorios Polivalentes"),
  ]},
  { id: "func_est", titulo: "Dirección y Funcionamiento", campos: [
    yn("REG_ENF_TRANS",    "Reg. Enf. Traslados"),
    yn("REG_INT",          "Reglamento Interno"),
    yn("REG_PSICO",        "Registro Psicología"),
    yn("REG_HIS_CLI_COMP", "HC Completas"),
    num("NRO_PLANTAS",     "N° Plantas"),
    yn("PL_EVA_INC",       "Plan Evacuación Incendio"),
    yn("SAL_EMERG",        "Salida de Emergencia"),
  ]},
];

// ── GENÉRICO (consultorios, odonto, tatoo, etc.) ──────────
const GENERICO = [
  { id: "cons_gen", titulo: "Consultorios", campos: [
    num("NRO",     "N° Consultorios"),
    yn("VENT",     "Ventilación"),
    yn("LAVABOS",  "Lavabos"),
    num("SUP",     "Superficie m²"),
    yn("BA_DISC",  "Baño Discapacitados"),
    yn("TECHO",    "Techo Conforme"),
    yn("PAREDES",  "Paredes Conformes"),
    yn("ILUM",     "Iluminación"),
    yn("PRIVA",    "Privacidad"),
  ]},
];

// ── EMERGENCIA ────────────────────────────────────────────
const EMERGENCIA = [
  { id: "guar_em", titulo: "Guardia / Emergencia", campos: [
    yn("C_E_GUARDIA",        "Condiciones Edilicias"),
    yn("P_GUARDIA",          "Planos"),
    num("MEDICOS_GUARDIA",   "N° Médicos de Guardia"),
    num("ENFERMERAS_GUARDIA","N° Enfermeras de Guardia"),
    yn("CARDI_GUARDIA",      "Cardiógrafo"),
    yn("ELEC_GUARDIA",       "Electrobisturí"),
  ]},
];

// ── TRASLADOS ─────────────────────────────────────────────
const TRASLADOS = [
  { id: "trasl", titulo: "Unidades de Traslado", campos: [
    txt("TIP_SOCI",     "Tipo de Sociedad"),
    yn("DIR_LIS_PROF",  "Directorio Profesionales"),
    num("NRO_TOT_AFI",  "N° Total Afiliados"),
    yn("ADI_PRIVA",     "Aditamento Privado"),
    yn("ORGA_FUNCI",    "Organigrama Funcional"),
    num("CANT_PER_ENF", "N° Personal Enfermería"),
    num("CANT_COND",    "N° Conductores"),
    yn("DIR_MEDICO",    "Director Médico"),
    yn("UN_ENF_MOV",    "Enf. en Móvil"),
    yn("MED_3AN",       "Médico c/3 años"),
    yn("MED_MOV",       "Médico en Móvil"),
    yn("CHO_MOV",       "Chofer en Móvil"),
  ]},
];

// ── Mapa tipología → secciones ────────────────────────────
const MAP = {
  "CLINICA":                CLINICA,
  "QUIRURGICOS":            QUIRURGICOS,
  "OPTICAS":                OPTICAS,
  "CENTROSAMBULATORIOS":    CENTROS_AMB,
  "ESTETICA/ONCOLOGICOS":   ESTETICA,
  "ODOONTOLOGICOS":         GENERICO,
  "CONSULTORIOS":           GENERICO,
  "EMERGENCIA":             EMERGENCIA,
  "TRASLADOS":              TRASLADOS,
  "TATOO":                  GENERICO,
  "FERTILIDADREPRODUCCION": GENERICO,
  "EXTRAHOSPITALARIOS":     GENERICO,
  "INTERNACIONDOMICILIARIA":GENERICO,
};

export function getSchema(tipologia) {
  const key = (tipologia || "").toUpperCase().replace(/[\s/\-]/g, "");
  const especificas = MAP[key] || MAP[key.replace("INTERNACIÓNDOMICILIARIA","INTERNACIONDOMICILIARIA")] || GENERICO;
  return [S_GENERAL, S_DIRECTOR, S_REGISTROS, ...especificas, S_OBS];
}
