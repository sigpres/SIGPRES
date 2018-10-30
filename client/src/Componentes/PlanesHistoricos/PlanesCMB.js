import React, { Component } from 'react';
import {Container, Row, Col, Button,  Modal, ModalHeader, 
  ModalBody, ModalFooter, Input, Label, Form, FormGroup, Table} from 'reactstrap';
import contraloria from '../../assets/img/contraloria.png';
import './PlanesHistoricos.css';
import withContext from './../../Contenedor/withContext';

export class PlanesCMB extends Component {
  constructor(props){
    super(props);
    this.state = {
      planes_operativos: [],
      modal_crear_plan_operativo_abierto: false,
      modal_editar_plan_operativo_abierto: false,
      nombre: undefined,
      inicio_periodo: 1950,
      fin_periodo: 1950,
      periodo: undefined,
      fichero: undefined,
      nuevo_fichero: false,
      enlace: undefined,
      id: undefined,
      habilitado: false,
      modal_operacion_exitosa: false,
      modal_operacion_fallida: false,
      mensaje: undefined,
      fichero_anterior: undefined,
    };
    this.crearPlanOperativo = this.crearPlanOperativo.bind(this);
    this.editarPlanOperativo = this.editarPlanOperativo.bind(this);
    this.verificarCamposModalCreacion = this.verificarCamposModalCreacion.bind(this);
    this.verificarCamposModalEdicion = this.verificarCamposModalEdicion.bind(this);
    this.cargarModalEdicion = this.cargarModalEdicion.bind(this);
    this.obtenerPlanesOperativos = this.obtenerPlanesOperativos.bind(this);
    this.eliminarPlanOperativo = this.eliminarPlanOperativo.bind(this);
  }

  async eliminarPlanOperativo(){
    const body = JSON.stringify({
      id: this.state.id,
      fichero: this.state.fichero_anterior,
    });

    const request_options = {
      method: "POST",
      credentials: "include",
      headers: {"Content-type": "application/json"},
      body: body
    };

    const eliminar_plan_request = await fetch('/api/planes_cmb/eliminar_plan_contraloria_municipal', request_options);
    const eliminar_plan_response = await eliminar_plan_request.json();

    if(eliminar_plan_response !== 'err'){
      this.setState({
        modal_editar_plan_operativo_abierto: false, 
        modal_operacion_exitosa: true, 
        mensaje: "Ordenanza de la Contraloría Municipal de Baruta eliminado exitosamente"}, async () => {
        this.obtenerPlanesOperativos();
      });
    }
    else{
      this.setState({
        modal_editar_plan_operativo_abierto: false, 
        modal_operacion_fallida: true, 
        mensaje: "Ha ocurrido un error al eliminar el Ordenanza de la Contraloría Municipal de Baruta"
      });
    }
  }

  async editarPlanOperativo(){
    if(this.verificarCamposModalEdicion()){
      // Verifica si se actualizó el archivo de la ordenanza
      // Si se actualizó, primero se sube el archivo y luego se 
      // actualiza la información del plan
      if(this.state.nuevo_fichero){
        let form_body = new FormData();

        form_body.append('fichero', this.state.fichero);
        form_body.append('fichero_anterior', this.state.fichero_anterior);
        form_body.append('id', this.state.id);

        const request_options = {
          method: 'post',
          credentials: 'include',
          body: form_body
        };

        const subir_nuevo_fichero_request = await fetch('/api/planes_cmb/actualizar_archivo_plan_contraloria_municipal', request_options);
        const subir_nuevo_fichero_response = await subir_nuevo_fichero_request.json();

        // Si el fichero se subió correctamente, procede a actualizar la información del plan
        if(subir_nuevo_fichero_response !== 'err'){
          let form_body_2 = JSON.stringify({
            id: this.state.id,
            nombre: this.state.nombre,
            periodo: `${this.state.inicio_periodo}-${this.state.fin_periodo}`
          });

          const request_options_2 = {
            method: 'post',
            credentials: 'include',
            headers: {"Content-Type": "application/json"},
            body: form_body_2
          };

          const actualizar_plan_request = await fetch('/api/planes_cmb/actualizar_plan_contraloria_municipal', request_options_2);
          const actualizar_plan_response = await actualizar_plan_request.json();

          if(actualizar_plan_response !== 'err'){
            this.setState({modal_editar_plan_operativo_abierto: false, modal_operacion_exitosa: true, mensaje: "Información del Ordenanza de la Contraloría Municipal de Baruta actualizada exitosamente"}, async () => {
              this.obtenerPlanesOperativos();
            });
          }
          else{
            this.setState({modal_editar_plan_operativo_abierto: false, modal_operacion_fallida: true, mensaje: "Error al actualizar la información del Ordenanza de la Contraloría Municipal de Baruta"});
          }
        }
        // De lo contrario, ocurrió un error y se le notifica al usuario
        else{
          this.setState({modal_editar_plan_operativo_abierto: false, modal_operacion_fallida: true, mensaje: "Error al subir el archivo al servidor"});
        }
      }
      else{
        let form_body = JSON.stringify({
          id: this.state.id,
          nombre: this.state.nombre,
          periodo: `${this.state.inicio_periodo}-${this.state.fin_periodo}`
        });

        const request_options = {
          method: 'post',
          credentials: 'include',
          headers: {"Content-Type": "application/json"},
          body: form_body
        };

        const actualizar_plan_request = await fetch('/api/planes_cmb/actualizar_plan_contraloria_municipal', request_options);
        const actualizar_plan_response = await actualizar_plan_request.json();

        if(actualizar_plan_response !== 'err'){
          this.setState({modal_editar_plan_operativo_abierto: false, modal_operacion_exitosa: true, mensaje: "Información del Ordenanza de la Contraloría Municipal de Baruta actualizada exitosamente"}, async () => {
            this.obtenerPlanesOperativos();
          });
        }
        else{
          this.setState({modal_editar_plan_operativo_abierto: false, modal_operacion_fallida: true, mensaje: "Error al actualizar la información del Ordenanza de la Contraloría Municipal de Baruta"});
        }
      }
    }
  }

  async obtenerPlanesOperativos(){
    const planes_request = await fetch('/api/planes_cmb/obtener_planes_contraloria_municipal', {credentials: 'include'});
    const planes_response = await planes_request.json();

    if(planes_response !== 'err'){
      this.setState({planes_operativos: planes_response});
    }
    else{
      this.setState({modal_operacion_fallida: true, mensaje: "Error al obtener los planes operativos de la Contraloría Municipal de Baruta"});
    }
  }

  cargarModalEdicion(index){
    const plan = this.state.planes_operativos[index];
    const periodo = plan.periodo.split("-");
    
    this.setState({
      modal_editar_plan_operativo_abierto: true,
      nombre: plan.nombre,
      enlace: plan.enlace,
      habilitado: plan.habilitado,
      inicio_periodo: periodo[0],
      fin_periodo: periodo[1],
      fichero: undefined,
      fichero_anterior: plan.fichero,
      id: plan.id
    });
  }

  verificarCamposModalCreacion(){
    let formulario_valido = true;

    if(this.state.nombre === undefined || this.state.nombre.length === 0 || this.state.nombre === ''){
      formulario_valido = false;
      document.getElementById("nombre-modal-creacion").style.display = "block";
    }
    else{
      document.getElementById("nombre-modal-creacion").style.display = "none";
    }

    let periodo = undefined;
    let inicio_periodo = 0;
    let fin_periodo = 0;

    if(this.state.inicio_periodo !== undefined && this.state.fin_periodo !== undefined){
      periodo = `${this.state.inicio_periodo}-${this.state.fin_periodo}`;
      inicio_periodo = parseInt(this.state.inicio_periodo, 10);
      fin_periodo = parseInt(this.state.fin_periodo, 10);
    }

    if(periodo === undefined){
      formulario_valido = false;
      document.getElementById("periodo-modal-creacion").style.display = "block";
    }
    else{
      document.getElementById("periodo-modal-creacion").style.display = "none";
    }

    if(inicio_periodo > fin_periodo){
      formulario_valido = false;
      document.getElementById("periodo2-modal-creacion").style.display = "block";
    }
    else{
      document.getElementById("periodo2-modal-creacion").style.display = "none";
    }

    if(this.state.fichero === undefined){
      formulario_valido = false;
      document.getElementById("fichero-modal-creacion").style.display = "block";

    }
    else{
      document.getElementById("fichero-modal-creacion").style.display = "none";
    }

    return formulario_valido;
  }

  verificarCamposModalEdicion(){
    let formulario_valido = true;
    if(this.state.nombre === undefined || this.state.nombre.length === 0 || this.state.nombre === ''){
      formulario_valido = false;
      document.getElementById("nombre-modal-edicion").style.display = "block";
    }
    else{
      document.getElementById("nombre-modal-edicion").style.display = "none";
    }
    
    let periodo = undefined;
    let inicio_periodo = 0;
    let fin_periodo = 0;
    
    if(this.state.inicio_periodo !== undefined && this.state.fin_periodo !== undefined){
      periodo = `${this.state.inicio_periodo}-${this.state.fin_periodo}`;
      inicio_periodo = parseInt(this.state.inicio_periodo, 10);
      fin_periodo = parseInt(this.state.fin_periodo, 10);
    }
    
    if(periodo === undefined || periodo.includes('undefined')){
      formulario_valido = false;
      document.getElementById("periodo-modal-edicion").style.display = "block";
    }
    else{
      document.getElementById("periodo-modal-edicion").style.display = "none";
    }
    
    if(inicio_periodo > fin_periodo){
      formulario_valido = false;
      document.getElementById("periodo2-modal-edicion").style.display = "block";
    }
    else{
      document.getElementById("periodo2-modal-edicion").style.display = "none";
    }
    
    if(this.state.nuevo_fichero && this.state.fichero === undefined){
      formulario_valido = false;
      document.getElementById("fichero-modal-edicion").style.display = "block";

    }
    else{
      document.getElementById("fichero-modal-edicion").style.display = "none";
    }

    
    return formulario_valido;
  }

  async crearPlanOperativo(){
    if(this.verificarCamposModalCreacion()){
      let form_body = new FormData();
      form_body.append('fichero', this.state.fichero);
      form_body.append('nombre', this.state.nombre);
      form_body.append('periodo', `${this.state.inicio_periodo}-${this.state.fin_periodo}`);

      const request_options = {
        method: 'post',
        credentials: 'include',
        body: form_body
      };

      const crear_plan_request = await fetch(`/api/planes_cmb/crear_plan_contraloria_municipal`, request_options);
      const crear_plan_response = await crear_plan_request.json();

      if(crear_plan_response !== 'err'){
        this.setState({modal_crear_plan_operativo_abierto: false, modal_operacion_exitosa: true, mensaje: "Ordenanza de la Contraloría Municipal de Baruta creado correctamente"}, async () => {
          this.obtenerPlanesOperativos();
        });
      }
      else{
        this.setState({modal_operacion_fallida: true, modal_crear_plan_operativo_abierto: false, mensaje: "Error agregando el Ordenanza de la Contraloría Municipal de Baruta"});
      }
    }
  }

  async componentDidMount(){
    document.title = 'SICMB - Ordenanzas de la CMB';
    this.obtenerPlanesOperativos();
  }

  render() {
    let años = [];

    for(let i = 1950; i < 2050; i++){
      años.push(i);
    }

    let modal_crear_plan = 
      <Modal isOpen={this.state.modal_crear_plan_operativo_abierto} toggle={() => this.setState({modal_crear_plan_operativo_abierto: !this.state.modal_crear_plan_operativo_abierto})} size="md">
        <ModalHeader toggle={() => this.setState({modal_crear_plan_operativo_abierto: !this.state.modal_crear_plan_operativo_abierto})}>
          Crear nuevo Ordenanza de la CMB
        </ModalHeader>
      
        <ModalBody>
          <Form> 
            <FormGroup row>
              {/* Nombre de la ordenanza*/}
              <Col xs={12} sm={12} md={12} lg={12}>
                <Label>Nombre de la ordenanza*</Label>
                <Input 
                  onChange={(e) => this.setState({nombre: e.target.value})}
                />
                <span id="nombre-modal-creacion" className="error-plan">Nombre inválido</span>
              </Col>
            </FormGroup>

            <FormGroup row>
              {/* Periodo de la ordenanza*/}
              <Col xs={12} sm={12} md={12} lg={12}>
                <Label>Periodo de vigencia de la ordenanza*</Label>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6}>
                <Label>Año de inicio*</Label>
                <Input 
                  type="select"
                  onChange={(e) => this.setState({inicio_periodo: e.target.value})}
                >
                  {años.map((año, index) => {
                    return(
                      <option value={año} key={`opcion_inicio_periodo_${año}`}>{año}</option>
                    )
                  })}
                </Input>
              </Col>

              <Col xs={12} sm={12} md={6} lg={6}>
                <Label>Año de culminación*</Label>
                <Input 
                  type="select"
                  onChange={(e) => this.setState({fin_periodo: e.target.value})}
                >
                  {años.map((año, index) => {
                    return(
                      <option value={año} key={`opcion_fin_periodo_${año}`}>{año}</option>
                    )
                  })}
                </Input>
              </Col>
              <Col xs={12} sm={12} md={12} lg={12}>              
                <span id="periodo-modal-creacion" className="error-plan">Periodo inválido.</span>
                <span id="periodo2-modal-creacion" className="error-plan">El año de inicio no puede ser posterior al año de culminación.</span>
              </Col>
            </FormGroup>

            <FormGroup row>
              {/* Fichero de la ordenanza*/}
              <Col xs={12} sm={12} md={12} lg={12}>
                <Label>Archivo de la ordenanza*</Label>
              </Col>

              <Col xs={12} sm={12} md={12} lg={12}>
                <Input
                  id="ficher_modal_creacion"
                  type="file"
                  label={this.state.fichero !== undefined ? `${this.state.fichero.name.slice(0,5)}...` : "Seleccione un archivo"}
                  onChange={(e) => this.setState({fichero: e.target.files[0]})}
                />
              </Col>

              <Col xs={12} sm={12} md={12} lg={12}>              
                <span id="fichero-modal-creacion" className="error-plan">Fichero inválido.</span>
              </Col>
            </FormGroup>
          </Form>
        </ModalBody>
      
        <ModalFooter>
          <Col className="text-center" xs={12} sm={12} md={12} lg={12} >
            <Button onClick={this.crearPlanOperativo} color="success" type="submit" className="boton-crear-modal">
              Crear plan
            </Button>
            
            <Button color="danger" onClick={() => this.setState({modal_crear_plan_operativo_abierto: false})} className="boton-cancelar-modal">
              Cancelar
            </Button>
          </Col>
        </ModalFooter>
      </Modal>
    ;

    let modal_editar_plan = 
      <Modal isOpen={this.state.modal_editar_plan_operativo_abierto} toggle={() => this.setState({modal_editar_plan_operativo_abierto: !this.state.modal_editar_plan_operativo_abierto})} size="md">
        <ModalHeader toggle={() => this.setState({modal_editar_plan_operativo_abierto: !this.state.modal_editar_plan_operativo_abierto})}>
          Editar Ordenanza de la CMB
        </ModalHeader>
      
        <ModalBody>
          <Form> 
            <FormGroup row>
              {/* Nombre de la ordenanza*/}
              <Col xs={12} sm={12} md={12} lg={12}>
                <Label>Nombre de la ordenanza*</Label>
                <Input 
                  defaultValue={this.state.nombre}
                  onChange={(e) => this.setState({nombre: e.target.value})}
                />
                <span id="nombre-modal-edicion" className="error-plan">Nombre inválido</span>
              </Col>
            </FormGroup>

            <FormGroup row>
              {/* Periodo de la ordenanza*/}
              <Col xs={12} sm={12} md={12} lg={12}>
                <Label>Periodo de vigencia de la ordenanza*</Label>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6}>
                <Label>Año de inicio*</Label>
                <Input 
                  type="select"
                  defaultValue={this.state.inicio_periodo}
                  onChange={(e) => this.setState({inicio_periodo: e.target.value})}
                >
                  {años.map((año, index) => {
                    return(
                      <option value={año} key={`opcion_inicio_periodo_${año}`}>{año}</option>
                    )
                  })}
                </Input>
              </Col>

              <Col xs={12} sm={12} md={6} lg={6}>
                <Label>Año de culminación*</Label>
                <Input 
                  type="select"
                  defaultValue={this.state.fin_periodo}
                  onChange={(e) => this.setState({fin_periodo: e.target.value})}
                >
                  {años.map((año, index) => {
                    return(
                      <option value={año} key={`opcion_fin_periodo_${año}`}>{año}</option>
                    )
                  })}
                </Input>
              </Col>
              <Col xs={12} sm={12} md={12} lg={12}>              
                <span id="periodo-modal-edicion" className="error-plan">Periodo inválido.</span>
                <span id="periodo2-modal-edicion" className="error-plan">El año de inicio no puede ser posterior al año de culminación.</span>
              </Col>
            </FormGroup>

            <FormGroup row>
              {/* Fichero de la ordenanza*/}
              <Col xs={12} sm={12} md={12} lg={12}>
                <Label>Archivo de la ordenanza</Label>
              </Col>

              <Col xs={12} sm={12} md={6} lg={6} className="align-self-end">
                <Label>Ver archivo actual</Label>
                <Button color="primary" onClick={() => window.open(this.state.enlace,'_blank')}>
                  Click para ver archivo
                </Button>
              </Col>

              <Col xs={12} sm={12} md={6} lg={6}>
                <Label>Subir nuevo archivo</Label>
                <Input
                  id="ficher_modal_edicion"
                  type="file"
                  label={this.state.fichero !== undefined ? this.state.fichero.name : "Seleccione un archivo"}
                  onChange={(e) => this.setState({nuevo_fichero: true, fichero: e.target.files[0]})}
                />
              </Col>

              <Col xs={12} sm={12} md={12} lg={12}>              
                <span id="fichero-modal-edicion" className="error-plan">Fichero inválido.</span>
              </Col>
            </FormGroup>
          </Form>
        </ModalBody>
      
        <ModalFooter>
          <Col className="text-center" xs={12} sm={12} md={12} lg={12} >
            <Button onClick={this.editarPlanOperativo} color="success" type="submit" className="boton-crear-modal">
              Editar plan
            </Button>

            <Button onClick={this.eliminarPlanOperativo} color="warning" type="submit" className="boton-eliminar-modal">
              Eliminar plan
            </Button>
            
            <Button color="danger" onClick={() => this.setState({modal_editar_plan_operativo_abierto: false})} className="boton-cancelar-modal">
              Cancelar
            </Button>
          </Col>
        </ModalFooter>
      </Modal>
    ;

    // Si al realizar cualquier operación ocurre algún error, se muestra este modal
    let modal_operacion_fallida = 
      <Modal isOpen={this.state.modal_operacion_fallida} toggle={() => this.setState({modal_operacion_fallida: !this.state.modal_operacion_fallida})}>
        <ModalHeader toggle={() => this.setState({modal_operacion_fallida: !this.state.modal_operacion_fallida})}>
          Error en la operación
        </ModalHeader>

        <ModalBody>
          <p>Ha ocurrido un error al procesar la operación.</p>
          <p>Mensaje: {this.state.mensaje}</p>
          <p>Revise la consola del navegador o del servidor para obtener más información acerca del error.</p>
        </ModalBody>

        <ModalFooter>
          <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
            <Button color="danger" onClick={() => this.setState({modal_operacion_fallida: false})}>
              Cerrar
            </Button>
          </Col>
        </ModalFooter>

      </Modal>
    ;

    // Si al realizar cualquier operación, esta se realiza exitosamente, se muestra este modal
    let modal_operacion_exitosa = 
      <Modal isOpen={this.state.modal_operacion_exitosa} toggle={() => this.setState({modal_operacion_exitosa: !this.state.modal_operacion_exitosa})}>
        <ModalHeader toggle={() => this.setState({modal_operacion_exitosa: !this.state.modal_operacion_exitosa})}>
          Operación exitosa
        </ModalHeader>
        <ModalBody>
          <p>La operación se ha realizado exitosamente.</p>
          <p>Mensaje: {this.state.mensaje}</p>
        </ModalBody>
        <ModalFooter>
          <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
            <Button color="danger" onClick={() => this.setState({modal_operacion_exitosa: false})}>
              Cerrar
            </Button>
          </Col>
        </ModalFooter>
      </Modal>
    ;

    return (
      <Container fluid className="container-planes">
        {/* Modales del componente */}
        {modal_crear_plan}
        {modal_editar_plan}
        {modal_operacion_fallida}
        {modal_operacion_exitosa}

        <Row>
          {/* Título de la sección */}
          <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
            <img src={contraloria} className="icono-titulo"/>    
            <h1 className="titulo-unidades-de-medida">Gestión de Ordenanzas <br/> de la Contraloría Municipal de Baruta</h1>
          </Col>

          {/* Botón para agregar planes operativos */}
          <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
            <Button color="info" className="boton-agregar" onClick={() => this.setState({modal_crear_plan_operativo_abierto: true})}>
              <i className="iconos fa fa-plus" aria-hidden="true"></i>              
              Agregar ordenanza
            </Button>
          </Col>
        </Row>

        {/* Si existen planes operativos, muestra una tabla con el contenido de los mismos. De lo contrario, invita al usuario a crear un nuevo plan */}
        {this.state.planes_operativos.length > 0 ?
          <Row className="justify-content-center">
            <Table striped>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Periodo</th>                    
                    <th>Enlace</th>
                    <th>Opciones</th>
                  </tr>
                </thead>
                  <tbody>
                  {this.state.planes_operativos.map((plan, index) => {
                      return(
                      <tr key={`plan_operativo_cgr_${index}`}>
                          <th scope="row">{plan.id}</th>
                          <td>{plan.nombre}</td>
                          <td>{plan.periodo}</td>
                          <td>
                            <Button 
                                color="info" className="boton-ver"
                                onClick={() =>  window.open(plan.enlace,'_blank')}
                            >
                              <i className="far fa-eye"></i> Ver plan
                            </Button>
                          </td>
                          <td>
                            <Button 
                                color="info" className="boton-gestionar"
                                onClick={() => this.cargarModalEdicion(index)}
                            >
                                <i className="iconos fa fa-cogs" aria-hidden="true"></i>                          
                                Gestionar
                            </Button>
                          </td>
                      </tr>
                      )
                  })}
                  </tbody>
              </Table>
          </Row>

          :

          <Row className="justify-content-center">
            <Col xs={12} sm={12} md={6} lg={6} className="text-center"> 
              <h3>
                Aún no existen Ordenanzas de la Contraloría Municipal de Baruta 
                <br/> 
                Haga click en el botón "Agregar ordenanza" o contacte a un administrador para agregar un nuevo plan.
              </h3>
            </Col>
          </Row>
        }
      </Container>
    )
  }
}

export default withContext(PlanesCMB);