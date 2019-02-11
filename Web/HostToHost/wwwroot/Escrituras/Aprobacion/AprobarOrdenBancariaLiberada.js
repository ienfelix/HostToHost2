
$(window.document).ready(function () {
    fcCargaInicial();
});

function fcCargaInicial() {
    var esCorrecto = true;
    try {
        var queryString = window.location.search.split(constante.QUESTION);
        if (queryString == "" || queryString.length < constante._2)
        {
            esCorrecto = false;
        }
        else
        {
            var key = queryString[constante._1].split(constante.EQUAL)[constante._0];
            var string64OrdenBancaria = queryString[constante._1].split(constante.EQUAL)[constante._1];
            
            if (key == "" || string64OrdenBancaria == "")
            {
                esCorrecto = false;
            }
            else
            {
                var encodedOrdenBancaria = atob(string64OrdenBancaria);
                var decodedOrdenBancaria = decodeURIComponent(encodedOrdenBancaria);
                var ordenBancaria = JSON.parse(decodedOrdenBancaria);
                fcObtenerVistaParcialOrdenBancariaPorAprobar(ordenBancaria);
            }
        }

        if (esCorrecto === false)
        {
            felix.fcAlertRedirect(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES, function () {
                window.location.href = constante.HREF_APROBACION_LISTAR_ORDENES_BANCARIAS_POR_APROBAR;
            });
        }
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcObtenerVistaParcialOrdenBancariaPorAprobar(ordenBancaria) {
    try {
        if (typeof ordenBancaria === "undefined" || ordenBancaria.length === 0)
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        var parametros = felix.format("{0}{1}{2}{3}", constante.QUESTION, constante.ID_TIPO_ORDEN, constante.EQUAL, ordenBancaria.idTipoOrden);

        felix.fcHttpClient(constante.ASYNC_TRUE, constante.HTTP_GET, constante.APROBACION_OBTENER_VISTA_PARCIAL_ORDEN_BANCARIA_POR_APROBAR_ASYNC, parametros, function (res) {
            if (res !== "")
            {
                if (res.codigo === constante.CODIGO_OK)
                {
                    $("#dvOrdenBancaria").replaceWith(res.vistaParcialOrdenBancariaPorAprobar);
                    $("#dvAccionesOrdenBancaria").replaceWith(res.vistaParcialAccionesOrdenBancaria);
                    fcMostrarOrdenBancariaPorAprobar(ordenBancaria);
                    fcListarFlujoAprobacion(ordenBancaria);
                }
                else if (res.codigo === constante.CODIGO_NO_AUTENTICADO)
                {
                    felix.fcAlertRedirect(constante.TITULO_MENSAJE, res.mensaje, function () {
                        window.location.href = res.url;
                    });
                }
                else
                {
                    felix.fcAlert(constante.TITULO_MENSAJE, res.mensaje);
                }
            }
        });
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcMostrarOrdenBancariaPorAprobar(ordenBancaria) {
    try {
        if (typeof ordenBancaria === "undefined" || ordenBancaria.length === 0)
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        $("#nav-obd-tab").hide();
        $("#dvComentarios").show();
        $("#btnAprobar").show();
        $("#btnDeshacer").hide();
        $("#btnAnular").hide();
        $("#btnRegresar").attr("href", constante.HREF_APROBACION_LISTAR_ORDENES_BANCARIAS_POR_APROBAR);
        var sociedad = felix.format("{0} - {1}", ordenBancaria.sociedad, ordenBancaria.sociedadCorto);
        $("#txtSociedad").val(sociedad);
        $("#txtIdSap").val(ordenBancaria.idSap);
        $("#txtAnio").val(ordenBancaria.anio);
        $("#txtFechaOrden").val(ordenBancaria.fechaOrden);
        var banco = felix.format("{0} - {1}", ordenBancaria.banco, ordenBancaria.bancoCorto);
        $("#txtBanco").val(banco);
        var tipoOrden = felix.format("{0} - {1}", ordenBancaria.tipoOrden, ordenBancaria.tipoOrdenCorto);
        $("#txtTipoOrden").val(tipoOrden);
        $("#txtEstadoOrden").val(ordenBancaria.estadoOrden);
        var monedaLocal = ordenBancaria.monedaLocal === "" ? "" : felix.format("{0} - {1}", ordenBancaria.monedaLocal, ordenBancaria.monedaCortoLocal);
        $("#txtMonedaLocal").val(monedaLocal);
        var importeLocal = ordenBancaria.importeLocal === 0 ? "" : ordenBancaria.importeLocal.toLocaleString(constante.LOCALE_EN, {minimumFractionDigits: constante._2});
        $("#txtImporteLocal").val(importeLocal);
        var monedaForanea = ordenBancaria.monedaForanea === "" ? "" : felix.format("{0} - {1}", ordenBancaria.monedaForanea, ordenBancaria.monedaCortoForanea);
        $("#txtMonedaForanea").val(monedaForanea);
        var importeForanea = ordenBancaria.importeForanea === 0 ? "" : ordenBancaria.importeForanea.toLocaleString(constante.LOCALE_EN, {minimumFractionDigits: constante._2});
        $("#txtImporteForanea").val(importeForanea);
        $("#txtUsuarioCreacion").val(ordenBancaria.usuarioCreacion);
        var fechaCreacion = felix.format("{0} {1}", ordenBancaria.fechaCreacion, ordenBancaria.horaCreacion);
        $("#txtFechaCreacion").val(fechaCreacion);
        $("#btnAprobar").on("click", function () {
            fcConsultarEstadoOrdenBancaria(ordenBancaria.idSociedad, ordenBancaria.idSap, ordenBancaria.anio, ordenBancaria.momentoOrden, ordenBancaria.idTipoOrden, ordenBancaria.nombreArchivo, ordenBancaria.rutaArchivo);
        });
        fcListarOrdenesBancariasDetallePorAprobar(ordenBancaria);
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcListarOrdenesBancariasDetallePorAprobar(ordenBancaria)
{
    try {
        if (typeof ordenBancaria === "undefined" || ordenBancaria.length === 0)
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        var parametros = felix.format("{0}{1}{2}{3}{4}{5}{6}{7}{8}{9}{10}{11}{12}{13}{14}{15}{16}{17}{18}{19}", constante.QUESTION, constante.ID_SOCIEDAD, constante.EQUAL, ordenBancaria.idSociedad, constante.AMPERSON, constante.ID_SAP, constante.EQUAL, ordenBancaria.idSap, constante.AMPERSON, constante.ANIO, constante.EQUAL, ordenBancaria.anio, constante.AMPERSON, constante.MOMENTO_ORDEN, constante.EQUAL, ordenBancaria.momentoOrden, constante.AMPERSON, constante.ID_TIPO_ORDEN, constante.EQUAL, ordenBancaria.idTipoOrden);

        felix.fcHttpClient(constante.ASYNC_TRUE, constante.HTTP_GET, constante.APROBACION_LISTAR_ORDENES_BANCARIAS_DETALLE_POR_APROBAR_ASYNC, parametros, function (res) {
            if (res !== "")
            {
                if (res.codigo === constante.CODIGO_OK)
                {
                    switch (ordenBancaria.idTipoOrden)
                    {
                        case constante.ID_TIPO_ORDEN_TRANSFERENCIA:
                        fcMostrarOrdenBancariaTransferencia(ordenBancaria, res.listaOrdenesBancariasDetalle[constante._0]);
                        break;
                        case constante.ID_TIPO_ORDEN_TRANSFERENCIA_BCR:
                        fcMostrarOrdenBancariaTransferenciaBcr(ordenBancaria, res.listaOrdenesBancariasDetalle);
                        break;
                        case constante.ID_TIPO_ORDEN_PROVEEDOR:
                        case constante.ID_TIPO_ORDEN_CAMARA_COMERCIO:
                        fcMostrarOrdenBancariaProveedor(ordenBancaria, res.listaOrdenesBancariasDetalle);
                        break;
                    }
                }
                else if (res.codigo === constante.CODIGO_OMISION)
                {
                    felix.fcAlertFixed(res.mensaje, constante.SWAL_POSITION_TOP_END, constante.SWAL_TIMER_2);
                }
                else if (res.codigo === constante.CODIGO_NO_AUTENTICADO)
                {
                    felix.fcAlertRedirect(constante.TITULO_MENSAJE, res.mensaje, function () {
                        window.location.href = res.url;
                    });
                }
                else
                {
                    felix.fcAlert(constante.TITULO_MENSAJE, res.mensaje);
                }
            }
        });
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcMostrarOrdenBancariaTransferencia(ordenBancaria, ordenBancariaDetalle) {
    try {
        if (typeof ordenBancaria === "undefined" || ordenBancaria.length === 0 || typeof ordenBancariaDetalle == "undefined" || ordenBancariaDetalle.length === 0)
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        var parametros = felix.format("{0}{1}{2}{3}", constante.QUESTION, constante.ID_TIPO_ORDEN, constante.EQUAL, ordenBancaria.idTipoOrden);

        felix.fcHttpClient(constante.ASYNC_TRUE, constante.HTTP_GET, constante.APROBACION_OBTENER_VISTA_PARCIAL_ORDEN_BANCARIA_DETALLE_POR_APROBAR_ASYNC, parametros, function (res) {
            if (res !== "")
            {
                if (res.codigo === constante.CODIGO_OK)
                {
                    $("#dvOrdenBancariaDetalle").replaceWith(res.vistaParcialOrdenBancariaDetallePorAprobar);
                    $("#txtTipoTransferencia").val(ordenBancariaDetalle.tipoTransferencia);
                    $("#txtReferencia1").val(ordenBancariaDetalle.referencia1);
                    $("#txtReferencia2").val(ordenBancariaDetalle.referencia2);
                    var monedaCargo = felix.format("{0} - {1}", ordenBancariaDetalle.monedaCargo, ordenBancariaDetalle.monedaCargoCorto);
                    $("#txtMonedaCargo").val(monedaCargo);
                    $("#txtCuentaCargo").val(ordenBancariaDetalle.cuentaCargo);
                    var montoCargo = ordenBancariaDetalle.montoCargo === 0 ? "" : ordenBancariaDetalle.montoCargo.toLocaleString(constante.LOCALE_EN, {minimumFractionDigits: constante._2});
                    $("#txtMontoCargo").val(montoCargo);
                    var monedaAbono = felix.format("{0} - {1}", ordenBancariaDetalle.monedaAbono, ordenBancariaDetalle.monedaAbonoCorto);
                    $("#txtMonedaAbono").val(monedaAbono);
                    $("#txtCuentaAbono").val(ordenBancariaDetalle.cuentaAbono);
                    var montoAbono = ordenBancariaDetalle.montoAbono === 0 ? "" : ordenBancariaDetalle.montoAbono.toLocaleString(constante.LOCALE_EN, {minimumFractionDigits: constante._2});
                    $("#txtMontoAbono").val(montoAbono);
                    var tipoCambio  = ordenBancariaDetalle.tipoCambio || "";
                    $("#txtTipoCambio").val(tipoCambio);
                    $("#txtModuloRaiz").val(ordenBancariaDetalle.moduloRaiz);
                    $("#txtDigitoControl").val(ordenBancariaDetalle.digitoControl);
                    $("#txtIndicador").val(ordenBancariaDetalle.indicador);
                    $("#txtNroOperacion").val(ordenBancariaDetalle.nroOperacion);
                    $("#txtBeneficiario").val(ordenBancariaDetalle.beneficiario);
                    var tipoDocumento = felix.format("{0} - {1}", ordenBancariaDetalle.tipoDocumento, ordenBancariaDetalle.tipoDocumentoCorto);
                    $("#txtTipoDocumento").val(tipoDocumento);
                    $("#txtNroDocumento").val(ordenBancariaDetalle.nroDocumento);
                }
                else if (res.codigo === constante.CODIGO_NO_AUTENTICADO)
                {
                    felix.fcAlertRedirect(constante.TITULO_MENSAJE, res.mensaje, function () {
                        window.location.href = res.url;
                    });
                }
                else
                {
                    felix.fcAlert(constante.TITULO_MENSAJE, res.mensaje);
                }
            }
        });
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcMostrarOrdenBancariaTransferenciaBcr(ordenBancaria, listaOrdenesBancariasDetalle) {
    try {
        if (typeof ordenBancaria === "undefined" || ordenBancaria.length === 0 || typeof listaOrdenesBancariasDetalle == "undefined" || listaOrdenesBancariasDetalle.length === 0)
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        $("#nav-obd-tab").show();
        $("#dvOrdenBancariaDesglose").empty();
        var tabla = "<table class=\"table table-sm table-striped table-hover\">";
        tabla += "<thead class=\"thead-dark\" align=\"center\"><tr>";
        tabla += "<th>Referencia 1</th>";
        tabla += "<th>Moneda Cargo</th>";
        tabla += "<th>Cuenta Cargo</th>";
        tabla += "<th>Monto Cargo</th>";
        tabla += "<th>Beneficiario</th>";
        tabla += "<th>Nombre Banco</th>";
        tabla += "<th></th>";
        tabla += "</tr></thead>";

        for (var i = 0; i < listaOrdenesBancariasDetalle.length; i++)
        {
            tabla += "<tr>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].referencia1 + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].monedaCargo + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].cuentaCargo + "</td>";
            var montoCargo = listaOrdenesBancariasDetalle[i].montoCargo === 0 ? "" : listaOrdenesBancariasDetalle[i].montoCargo.toLocaleString(constante.LOCALE_EN, {minimumFractionDigits: constante._2});
            tabla += "<td>" + montoCargo + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].beneficiario + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].nombreBanco + "</td>";
            var stringOrdenBancaria = JSON.stringify(ordenBancaria);
            var encodedOrdenBancaria = encodeURIComponent(stringOrdenBancaria);
            var string64OrdenBancaria = btoa(encodedOrdenBancaria);
            var stringOrdenBancariaDetalle = JSON.stringify(listaOrdenesBancariasDetalle[i]);
            var encodedOrdenBancariaDetalle = encodeURIComponent(stringOrdenBancariaDetalle);
            var string64OrdenBancariaDetalle = btoa(encodedOrdenBancariaDetalle);
            tabla += "<td><div class=\"d-flex\"><i class=\"material-icons cursor\" onclick=\"fcAprobarOrdenBancariaDetalleLiberada('" + ordenBancaria.idTipoOrden + "', '" + string64OrdenBancaria + "', '" + string64OrdenBancariaDetalle + "');\" title=\"Ver Pago\" >search</i>";
            tabla += "</div></td>";
            tabla += "</tr>";
        }

        tabla += "</table>";
        $("#dvOrdenBancariaDesglose").append(tabla);
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcMostrarOrdenBancariaProveedor(ordenBancaria, listaOrdenesBancariasDetalle) {
    try {
        if (typeof ordenBancaria === "undefined" || ordenBancaria.length === 0 || typeof listaOrdenesBancariasDetalle == "undefined" || listaOrdenesBancariasDetalle.length === 0)
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        $("#nav-obd-tab").show();
        $("#dvOrdenBancariaDesglose").empty();
        var tabla = "<table class=\"table table-sm table-striped table-hover\">";
        tabla += "<thead class=\"thead-dark\" align=\"center\"><tr>";
        tabla += "<th>Sub Tipo Pago</th>";
        tabla += "<th>Referencia 1</th>";
        tabla += "<th>Moneda Abono</th>";
        tabla += "<th>Cuenta Abono</th>";
        tabla += "<th>Importe Neto</th>";
        tabla += "<th>Beneficiario</th>";
        tabla += "<th>Nro Factura</th>";
        tabla += "<th>Fecha Factura</th>";
        tabla += "<th>Fecha Fin Factura</th>";
        tabla += "<th></th>";
        tabla += "</tr></thead>";

        for (var i = 0; i < listaOrdenesBancariasDetalle.length; i++)
        {
            tabla += "<tr>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].subTipoPago + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].referencia1 + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].monedaAbono + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].cuentaAbono + "</td>";
            var montoAbono = listaOrdenesBancariasDetalle[i].montoAbono === 0 ? "" : listaOrdenesBancariasDetalle[i].montoAbono.toLocaleString(constante.LOCALE_EN, {minimumFractionDigits: constante._2});
            tabla += "<td>" + montoAbono + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].beneficiario + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].nroFactura + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].fechaFactura + "</td>";
            tabla += "<td>" + listaOrdenesBancariasDetalle[i].fechaFinFactura + "</td>";
            var stringOrdenBancaria = JSON.stringify(ordenBancaria);
            var encodedOrdenBancaria = encodeURIComponent(stringOrdenBancaria);
            var string64OrdenBancaria = btoa(encodedOrdenBancaria);
            var stringOrdenBancariaDetalle = JSON.stringify(listaOrdenesBancariasDetalle[i]);
            var encodedOrdenBancariaDetalle = encodeURIComponent(stringOrdenBancariaDetalle);
            var string64OrdenBancariaDetalle = btoa(encodedOrdenBancariaDetalle);
            tabla += "<td><div class=\"d-flex\"><i class=\"material-icons cursor\" onclick=\"fcAprobarOrdenBancariaDetalleLiberada('" + ordenBancaria.idTipoOrden + "', '" + string64OrdenBancaria + "', '" + string64OrdenBancariaDetalle + "');\" title=\"Ver Pago\" >search</i>";
            tabla += "</div></td>";
            tabla += "</tr>";
        }

        tabla += "</table>";
        $("#dvOrdenBancariaDesglose").append(tabla);
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcAprobarOrdenBancariaDetalleLiberada(idTipoOrden, string64OrdenBancaria, string64OrdenBancariaDetalle) {
    try {
        if (typeof idTipoOrden === "undefined" || idTipoOrden == "" || typeof string64OrdenBancaria === "undefined" || string64OrdenBancaria == "" || typeof string64OrdenBancariaDetalle === "undefined" || string64OrdenBancariaDetalle == "")
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        var url = felix.format(constante.APROBACION_APROBAR_ORDEN_BANCARIA_DETALLE_LIBERADA, idTipoOrden, string64OrdenBancaria, string64OrdenBancariaDetalle);
        window.location.href = url;
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcConsultarEstadoOrdenBancaria(idSociedad, idSap, anio, momentoOrden, idTipoOrden, nombreArchivo, rutaArchivo) {
    try {
        if (typeof idSociedad === "undefined" || idSociedad == "" || typeof idSap === "undefined" || idSap == "" || typeof anio === "undefined" || anio == "" || typeof momentoOrden === "undefined" || momentoOrden == "" || typeof nombreArchivo === "undefined" || nombreArchivo == "" || typeof rutaArchivo === "undefined" || rutaArchivo == "")
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        var parametros = felix.format("{0}{1}{2}{3}{4}{5}{6}{7}{8}{9}{10}{11}{12}{13}{14}{15}{16}{17}{18}{19}", constante.QUESTION, constante.ID_SOCIEDAD, constante.EQUAL, idSociedad, constante.AMPERSON, constante.ID_SAP, constante.EQUAL, idSap, constante.AMPERSON, constante.ANIO, constante.EQUAL, anio, constante.AMPERSON, constante.MOMENTO_ORDEN, constante.EQUAL, momentoOrden, constante.AMPERSON, constante.ID_TIPO_ORDEN, constante.EQUAL, idTipoOrden);

        felix.fcHttpClient(constante.ASYNC_TRUE, constante.HTTP_GET, constante.APROBACION_CONSULTAR_ESTADO_ORDEN_BANCARIA_ASYNC, parametros, function (res) {
            if (res !== "")
            {
                if (res.codigo === constante.CODIGO_OK)
                {
                    if (res.idEstadoOrden === constante.ID_ESTADO_ORDEN_LIBERADO)
                    {
                        fcAprobarOrdenBancariaLiberada(idSociedad, idSap, anio, momentoOrden, idTipoOrden, nombreArchivo, rutaArchivo, constante.ID_ESTADO_ORDEN_LIBERADO);
                    }
                    else if (res.idEstadoOrden === constante.ID_ESTADO_ORDEN_PRE_APROBADO)
                    {
                        if (res.esHorarioBanco === constante.ES_HORARIO_BANCO_SI)
                        {
                            felix.fcAlertConfirm(constante.TITULO_MENSAJE, constante.MENSAJE_APROBAR_ORDEN_BANCARIA, function () {
                                fcAprobarOrdenBancariaLiberada(idSociedad, idSap, anio, momentoOrden, idTipoOrden, nombreArchivo, rutaArchivo, constante.ID_ESTADO_ORDEN_PRE_APROBADO);
                            });
                        }
                        else if (res.esHorarioBanco === constante.ES_HORARIO_BANCO_NO)
                        {
                            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_HORARIO_ATENCION_BANCO);
                        }
                    }
                }
                else if (res.codigo === constante.CODIGO_NO_AUTENTICADO)
                {
                    felix.fcAlertRedirect(constante.TITULO_MENSAJE, res.mensaje, function () {
                        window.location.href = res.url;
                    });
                }
                else
                {
                    felix.fcAlert(constante.TITULO_MENSAJE, res.mensaje);
                }
            }
        });
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcAprobarOrdenBancariaLiberada(idSociedad, idSap, anio, momentoOrden, idTipoOrden, nombreArchivo, rutaArchivo, idEstadoOrden) {
    try {
        if (typeof idSociedad === "undefined" || idSociedad == "" || typeof idSap === "undefined" || idSap == "" || typeof anio === "undefined" || anio == "" || typeof momentoOrden === "undefined" || momentoOrden == "" || typeof idTipoOrden === "undefined" || idTipoOrden == "" || typeof nombreArchivo === "undefined" || nombreArchivo == "" || typeof rutaArchivo === "undefined" || rutaArchivo == "")
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        var comentarios = $("#txtComentarios").val().trim();
        var parametros = new Array();
        parametros[0] = idSociedad;
        parametros[1] = idSap;
        parametros[2] = anio;
        parametros[3] = momentoOrden;
        parametros[4] = idTipoOrden;
        parametros[5] = comentarios;
        parametros[6] = nombreArchivo;
        parametros[7] = rutaArchivo;
        parametros[8] = idEstadoOrden;

        felix.fcHttpClient(constante.ASYNC_TRUE, constante.HTTP_PUT, constante.APROBACION_APROBAR_ORDEN_BANCARIA_LIBERADA_ASYNC, parametros, function (res) {
            if (res !== "")
            {
                if (res.codigo === constante.CODIGO_OK)
                {
                    felix.fcAlertRedirect(constante.TITULO_MENSAJE, res.mensaje, function () {
                        var href = $("#btnRegresar").attr("href");
                        window.location.href = href;
                    });
                }
                else if (res.codigo === constante.CODIGO_NO_AUTENTICADO)
                {
                    felix.fcAlertRedirect(constante.TITULO_MENSAJE, res.mensaje, function () {
                        window.location.href = res.url;
                    });
                }
                else
                {
                    felix.fcAlert(constante.TITULO_MENSAJE, res.mensaje);
                }
            }
        });
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}

function fcListarFlujoAprobacion(ordenBancaria) {
    try {
        if (typeof ordenBancaria === "undefined" || ordenBancaria.length === 0)
        {
            felix.fcAlert(constante.TITULO_MENSAJE, constante.MENSAJE_PARAMETROS_NO_PRESENTES);
            return false;
        }

        var parametros = felix.format("{0}{1}{2}{3}{4}{5}{6}{7}{8}{9}{10}{11}{12}{13}{14}{15}{16}{17}{18}{19}", constante.QUESTION, constante.ID_SOCIEDAD, constante.EQUAL, ordenBancaria.idSociedad, constante.AMPERSON, constante.ID_SAP, constante.EQUAL, ordenBancaria.idSap, constante.AMPERSON, constante.ANIO, constante.EQUAL, ordenBancaria.anio, constante.AMPERSON, constante.MOMENTO_ORDEN, constante.EQUAL, ordenBancaria.momentoOrden, constante.AMPERSON, constante.ID_TIPO_ORDEN, constante.EQUAL, ordenBancaria.idTipoOrden);

        felix.fcHttpClient(constante.ASYNC_TRUE, constante.HTTP_GET, constante.APROBACION_LISTAR_FLUJO_APROBACION_ASYNC, parametros, function (res) {
            if (res !== "")
            {
                if (res.codigo === constante.CODIGO_OK)
                {
                    $("#dvFlujoAprobacion").empty();
                    var tabla = "<table class=\"table table-sm table-striped table-hover\">";
                    tabla += "<thead class=\"thead-dark\" align=\"center\"><tr>";
                    tabla += "<th>#</th>";
                    tabla += "<th>Estado Flujo</th>";
                    tabla += "<th>Comentarios</th>";
                    tabla += "<th>Usuario Ejecución</th>";
                    tabla += "<th>Fecha Ejecución</th>";
                    tabla += "</tr></thead>";

                    for (var i = 0; i < res.listaFlujoAprobacion.length; i++)
                    {
                        tabla += "<tr>";
                        tabla += "<td>" + res.listaFlujoAprobacion[i].idFlujoAprobacion + "</td>";
                        var estadoFlujo = felix.format("{0} - {1}", res.listaFlujoAprobacion[i].estadoFlujo, res.listaFlujoAprobacion[i].estadoFlujoCorto);
                        tabla += "<td>" + estadoFlujo + "</td>";
                        tabla += "<td>" + res.listaFlujoAprobacion[i].comentarios + "</td>";
                        tabla += "<td>" + res.listaFlujoAprobacion[i].usuarioCreacion + "</td>";
                        var fechaCreacion = felix.format("{0} {1}", res.listaFlujoAprobacion[i].fechaCreacion, res.listaFlujoAprobacion[i].horaCreacion);
                        tabla += "<td>" + fechaCreacion + "</td>";
                        tabla += "</tr>";
                    }

                    tabla += "</table>";
                    $("#dvFlujoAprobacion").append(tabla);
                }
                else if (res.codigo === constante.CODIGO_OMISION)
                {
                    $("#dvFlujoAprobacion").empty();
                    felix.fcAlertFixed(res.mensaje, constante.SWAL_POSITION_TOP_END, constante.SWAL_TIMER_2);
                }
                else if (res.codigo === constante.CODIGO_NO_AUTENTICADO)
                {
                    felix.fcAlertRedirect(constante.TITULO_MENSAJE, res.mensaje, function () {
                        window.location.href = res.url;
                    });
                }
                else
                {
                    felix.fcAlert(constante.TITULO_MENSAJE, res.mensaje);
                    $("#dvFlujoAprobacion").empty();
                }
            }
        });
    } catch (e) {
        felix.fcAlert(constante.TITULO_ERROR, e.message);
    }
}