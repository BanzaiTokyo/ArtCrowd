import React, {Fragment} from 'react'
import {Outlet} from "react-router-dom";
import Header from "./Header";
import {CssBaseline} from "@mui/material";
import Paper from '@mui/material/Paper';



const Layout = () => {
    return (
        <Fragment>
            <CssBaseline/>
            {/*--------- header*/
            }
            <Header/>
            {/*--------- main content*/
            }
            <Paper sx={{
                maxWidth: 1280,
                mx: 'auto', // margin left & right
                my: 4, // margin top & bottom
                py: 3, // padding top & bottom
                px: 2, // padding left & right
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRadius: 'sm',
                boxShadow: 'md',
            }}>

                <Outlet/>
            </Paper>
            {/*<Footer/>*/}
        </Fragment>
    )
        ;
}

export default Layout;
