import React, {useState, useEffect, useCallback, Suspense} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { Route, Redirect, withRouter } from 'react-router-dom';
import {Layout, notification} from 'antd';


import './scss/LayoutAdmin.scss';
import MenuTop from '../components/MenuTop';
import MenuSider from '../components/MenuSider';


import { isLoggedThunk, logoutThunk } from '../redux/thunks/authThunk';
import { fetchStatesThunk } from '../redux/thunks/statesThunk';
import { fetchRolesThunk } from '../redux/thunks/rolesThunk';
import { fetchCategoriesPlacesThunk } from '../redux/thunks/categoriesPlacesThunk';
import { fetchCategoriesServicesThunk } from '../redux/thunks/categoriesServicesThunk';
import LoadingSpinner from '../components/LoadingSpinner';


const LayoutAdmin = props => {
    
    const { Header, Content, Footer } = Layout;
    const { routes, location:{pathname} } = props;
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const {isLogged, isLoading, authError, authData} = useSelector(state=>state.auth);

    const dispatch = useCallback(useDispatch(),[]);


    const handleToggleMenu = ()=>{
        //console.log('colapso o abro');
        setIsCollapsed(!isCollapsed);
    }
    
    const handleLogout = ()=>{
        //console.log("logout")
        dispatch( logoutThunk() );
    }

    const openNotificationError = useCallback(() => {
        if(authData.message!==""){
            notification.error({
                message: authData.message  
            });
        }

      },[authData]);
    
      const openNotificationSuccess = useCallback(() => {
        //console.log("data",authData);
        notification.success({
            message: authData.message,
            description: "Bienvenid@ "+authData.data.name  
        });

      },[authData]);

      const openNotificationLogout = useCallback(() => {
        //console.log("data",authData);
        notification.info({
            message: authData.message,
        });

      },[authData]);


    useEffect(()=>{
        dispatch( isLoggedThunk() );
    },[dispatch]);

    useEffect(()=>{
        if(authData.action === "logout") {openNotificationLogout()};
        if(authError) {openNotificationError()};
        if(!authError && Object.keys(authData.data).length>0) {
            openNotificationSuccess()
        };
        

    },[dispatch, authError, authData, openNotificationLogout, openNotificationError, openNotificationSuccess]);

    useEffect(()=>{
        if(isLogged){
            dispatch(fetchStatesThunk());
            dispatch(fetchRolesThunk());
            dispatch(fetchCategoriesPlacesThunk());
            dispatch(fetchCategoriesServicesThunk());
        }
    },[dispatch, isLogged]);


    return(
        <>
            {
                
                isLoading
                ? <div className="layout-spinner"><LoadingSpinner/></div>
                : <Suspense fallback={ <div><LoadingSpinner/></div> }>

                    {                       
                        
                        !isLogged && !isLoading
                        ? <>
                            <Redirect to="/admin/login" />
                            <Layout className="layout-signin">
                                <Content className="layout-signin__content">
                                    { routes.map((route, index)=>(
                                        <RouteWithSubRoutes key={index} {...route}/>
                                    ))}
                                </Content>
                                <Footer className="layout-signin__footer">
                                    Pet Portal  |  © 2020  |  Norberto Ledo - Proyecto Final DAM
                                </Footer>
                            </Layout>
                        </>
                        : <>
                            <Redirect to={pathname === "/admin/login" ? "/admin" : pathname} />
                            <Layout>
                    
                                <MenuSider isCollapsed={isCollapsed}/>
                    
                                <Layout className="layout-admin">
                                    
                                    <Header className="layout-admin__header">
                                        <MenuTop
                                            handleToggleMenu={handleToggleMenu}
                                            handleLogout={handleLogout}
                                            isCollapsed={isCollapsed}
                                        />
                                    </Header>
                                    
                                    <Content className="layout-admin__content">
                                        { routes.map((route, index)=>(
                                            <RouteWithSubRoutes key={index} {...route}/>
                                        ))}
                                    </Content>

                                    <Footer className="layout-admin__footer">
                                        Pet Portal  |  © 2020  |  Norberto Ledo - Proyecto Final DAM
                                    </Footer>

                                </Layout>
                    
                            </Layout>
                        </>
                    }
                </Suspense>
            }
        
        </>
    );


}
const RouteWithSubRoutes = (route)=>{

    return(
      <Route
        path={route.path}
        exact={route.exact}
        render={props => <route.component routes={route.routes} {...props}/>}
      />
    )
  }

export default withRouter(LayoutAdmin);
