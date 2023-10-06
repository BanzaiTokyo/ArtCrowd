import React from 'react';

import {
    AppBar,
    Box,
    Button,
    Divider,
    Drawer,
    Link,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import {SITE_NAME} from "../Constants";
import LoginByWallet from "./LoginByWallet";

const drawerWidth = 240;

function Header() {

    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{textAlign: 'center'}}>
            <Typography variant="h6" sx={{my: 2}}>
                {SITE_NAME}
            </Typography>
            <Divider/>

            <List>
                <a href={'/about'}>
                    <ListItem disablePadding>
                        <ListItemButton sx={{textAlign: 'left'}}>
                            <ListItemIcon>
                                <InfoIcon/>
                            </ListItemIcon>
                            <ListItemText primary={"About"}/>
                        </ListItemButton>
                    </ListItem>
                </a>
                <ListItem disablePadding>
                    <ListItemButton sx={{textAlign: 'left'}}>
                        <ListItemIcon>
                            <PersonIcon/>
                        </ListItemIcon>
                        <LoginByWallet/>
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (<>
            <AppBar position={"relative"}>
                <Toolbar sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexGrow: 1,
                    justifyContent: 'center'
                }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{mr: 2, display: {sm: 'none'}}}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Box
                        display="flex"
                        justifyContent="center"
                        maxWidth={1280}
                        flexGrow={1}
                    >

                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                flexGrow: 1,
                                display: {xs: 'block', sm: 'block'},
                            }}
                        >
                            <Link href={'/'}
                                  style={{color: 'white', paddingRight:'5rem'}}
                                  color={'inherit'}
                                  underline="none">
                                {SITE_NAME}
                            </Link>

                            <Button sx={{color: '#fff'}}>
                                <Link href={'/about'}
                                      style={{color: 'white'}}
                                      color={'inherit'}
                                      underline="none"
                                >About</Link>
                            </Button>

                        </Typography>
                        <Box sx={{display: {xs: 'none', sm: 'block'}}}>
                            <LoginByWallet/>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: {xs: 'block', sm: 'none'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>


        </>
    );
}

export default Header;