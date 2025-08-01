#!/bin/bash

echo "启动AI培训管理后台"
echo "================================"

# 检查端口是否被占用
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# 杀死占用端口的进程
kill_port() {
    local port=$1
    local pid=$(lsof -t -i :$port)
    if [ ! -z "$pid" ]; then
        echo "端口 $port 被占用，正在停止进程..."
        kill -9 $pid
        sleep 2
    fi
}

# 检查并清理端口
if check_port 3002; then
    kill_port 3002
fi

# 设置端口为3002，避免与用户端冲突
export PORT=3002

# 启动管理后台
echo "启动管理后台（端口 3002）..."
npm start