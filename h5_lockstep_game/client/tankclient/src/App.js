import {useEffect, useState} from "react"
import './App.css';
import { Alert } from 'antd';
import Login from "./net/login"
import Socket from "./socket"
import {SceneMgr} from "./scenemgr"
import {FrameOp} from "./net/consts"
import {FrameMgr} from "./framemgr"


function App() {
  const [socket, setSocket] = useState(null)
  const [socketOpen, setSocketOpen] = useState(false)
  const [logined, setLogined] = useState(false)

  useEffect(() => {
    let client = new Socket("ws://127.0.0.1:8801")
    setSocket(client)

    client.onmessage()

    client.onopen(() => {
      console.log("连接打开了")
      setSocketOpen(true)
    })
    client.onclose(() => {
      setSocketOpen(false)
    })

    client.on("login_response", (data) => {
      console.log("login_response resp", data)

      if (data.ret !== 1) {
        return;
      }

      FrameMgr.getInstance().setStepInterval(data.frameInterval)
      setLogined(true);
      
      // 创建主角
      SceneMgr.getInstance().createMainRole(data.clientId)

      // 创建其他玩家
      if (data.clients && data.clients.length) {
        for (let i = 0; i < data.clients.length; ++i) {
          SceneMgr.getInstance().AddTank(data.clients[i])
        }
      }

      // 收帧
      if (data.frames && data.frames.length) {
          
          const lastFrames =  data.frames[ data.frames.length - 1]
          console.log("最后aaa", lastFrames.frame[lastFrames.frame.length - 1])
          
          FrameMgr.getInstance().setLoginFastRunningLastFrame(lastFrames.frame[lastFrames.frame.length - 1])
          for (let i = 0; i < data.frames.length; ++i) {
            FrameMgr.getInstance().AddFrame(data.frames[i].frame)
          }
      }

      // 进入游戏循环
      gameLoop(client, data.frameInterval)
    })


    client.on("player_enter_response", (data) => {
      console.log("玩家进来了",data)

      SceneMgr.getInstance().AddTank(data.clientId)
    })

    client.on("player_leave_response", (data) => {
      console.log("玩家离开",data)
      SceneMgr.getInstance().DeleteTank(data.clientId);
    })

    client.on("frame_sync", (data) => {
      // console.log("帧序列:", data.frames)
      if (data.frames && data.frames.length) {
        FrameMgr.getInstance().AddFrame(data.frames)
      }
    })

    return () => {
      client.close()
      unmount()
    }
  }, [])

  const unmount = () => {
  }


  const onLogin = (username, password) => {
    if (socket) {
        socket.sendLogin(username, password)
    }
  }

  const sendFrame = (client, op) =>{
    if (client) {
      client.sendFrameSyncOp(op);
    }
  }

  const gameLoop = (client, frameInterval) => {
    window.onkeydown = (e) => {
      // processKeyEvent(e)
      switch(e.keyCode) {
        case 38:
        case 87:
          sendFrame(client, FrameOp.MOVE_UP)
          break; // up
        case 40:
        case 83:
          sendFrame(client, FrameOp.MOVE_DOWN);
          break; // down
        case 37:
        case 65:
          sendFrame(client, FrameOp.MOVE_LEFT);
          break; // left
        case 39:
        case 68:
          sendFrame(client, FrameOp.MOVE_RIGHT);
          break; // right
        case 13:
          break;
      }
    }

    window.onmouseup = () => {
      sendFrame(client, FrameOp.FIRE_BULLET);
    }

    // 开启发帧定时器
    client.startFrameLoop(frameInterval)

    // 开启游戏循环
    SceneMgr.getInstance().StartGameLoop(frameInterval, document.getElementById('tankscene'));
  }

  return (
    <div className="App">
      {
        !logined ?
        <header className="App-header">
          {socketOpen ? <Alert message="服务器连接成功" type="success" showIcon /> : 
          <Alert message="服务器连接失败" type="error" showIcon />}
          <Login className="login" onLogin={onLogin}/>
        </header> : <canvas className="box" id="tankscene" height="800px" width="1000px"> </canvas>
      }

    </div>
  );
}

export default App;
