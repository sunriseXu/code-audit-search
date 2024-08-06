import * as React from 'react';
import Box from '@mui/material/Box';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { VSCodeBadge } from "@vscode/webview-ui-toolkit/react";
import BpCheckbox from './BpCheckbox';
import { RegexItem } from '../utilities/types/RTpyes';


interface RegexProps {
    initData: RegexItem[];
    type: string;
    checked: string;
    handleToggle: (item: any) => void;

}

const FireNav = styled(List)<{ component?: React.ElementType }>({
  '& .MuiListItemButton-root': {
    paddingLeft: 0,
    paddingRight: 0,
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: 16,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
    color: '#616161'
  },
  "& .MuiTouchRipple-root .MuiTouchRipple-child": {
  borderRadius: "2px"
}
});

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f2f2f2',
      color: '#616161',
      boxShadow: theme.shadows[1],
      fontSize: 11,
      BorderColor:'#cccccc'
    },
  }));

export default function RegexList(props: RegexProps) {

  const [open, setOpen] = React.useState(false);
  const initData = props.initData;
  const regexType = props.type
  console.log("regexType", regexType)
  console.log("initdata:", initData)
  // const [checked, setChecked] = React.useState("");

  function handleClick(item: any){
    window.postMessage({
      command:"click",
      message: item,
    }, "*");
  }

  return (
    <Box sx={{ display: 'flex', width: "100%", fontFamily: "'Segoe WPC', 'Segoe UI', sans-serif" }}>
      <ThemeProvider
        theme={createTheme({
          components: {
            MuiListItemButton: {
              defaultProps: {
                disableTouchRipple: true,
              },
            },
          },
          palette: {
            mode: 'light',
            primary: { main: 'rgb(102, 157, 246)' },
          },
        })}
      >
        <Paper elevation={0} sx={{ width: "100%", backgroundColor: "inherit" }}>
          <FireNav component="nav" disablePadding sx={{ width: "100%" }}>
            
            <Box
              sx={{
                pb: open ? 0.5 : 0,
                width: "100%"
              }}
            >
              <ListItemButton
                alignItems="flex-start"
                onClick={() => setOpen(!open)}
                sx={{
                  pt: 0.5,
                  pb: 0.5,
                  width: "100%"
                }}
              >
                <KeyboardArrowDown
                  sx={{
                    opacity: 0.9,
                    transform: open ? 'rotate(0)' : 'rotate(-90deg)',
                    transition: '0.2s',
                  }}
                />
                <ListItemText
                  primary={regexType}
                  primaryTypographyProps={{
                    fontSize: 13,
                    width: "100%",
                    color: '#616161'
                  }}
                  sx={{ my: 0 }}
                />
                
              </ListItemButton>
              {open &&
                initData.map((item) => (
                    <LightTooltip title={item?.label ? item?.label : item?.re}>
                        <ListItem
                            key={item?.label ? item?.label : item?.re}
                            secondaryAction={
                                <BpCheckbox
                                    edge="end"
                                    onChange={e => props.handleToggle(item)}
                                    checked={item?.label ? props.checked == item.label : props.checked == item.re}
                                />
                            }
                            disablePadding
                        >
                            <ListItemButton
                                key={item?.label ? item?.label : item?.re}
                                sx={{ py: 0, minHeight: 20, color: '#616161',width: "100%" }}
                                onClick={e => handleClick(item)}
                            >
                                <ListItemText
                                    primary={item?.label ? item?.label : item?.re}
                                    primaryTypographyProps={{ pl:1, fontSize: 12}}
                                />
                                {item?.lang ? <VSCodeBadge>{item.lang}</VSCodeBadge> : ""}
                                
                                
                            </ListItemButton>
                        </ListItem>
                    </LightTooltip>
                ))}
            </Box>
          </FireNav>
        </Paper>
      </ThemeProvider>
    </Box>
  );
}
