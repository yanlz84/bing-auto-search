// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.435
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["感悟十五五规划建议里的民生温度", "中方回应日本部署进攻性武器", "中国将寻找第二颗地球", "我国启动聚变领域国际科学计划", "在日中文导游：要带的大陆团都取消了", "俄罗斯将被邀请重返G8", "外交部回应“日方称已多次解释”", "直击西藏军区某部千人刺杀操大场面", "中方回应“高市称仍愿与中国对话”", "日官员：中日对立升级尚未达到顶点", "多种传染病病原菌已出现高耐药菌株", "网民冒用英烈警号行骗被刑拘", "雷倩：解放军若对日本出手绝不手软", "12条中日航线取消全部航班", "中纪委和最高检一天连打三“虎”", "大学拟2.93亿买490套房做学生宿舍", "“人造太阳”有望两年后“点燃”", "“偷甘蔗”农场有人只“偷”不给钱", "全国中小学寒假时间出炉 最长45天", "香港取消多场涉日活动", "神舟二十二号计划于11月25日发射", "李在明最新涉华表态", "高市早苗连续变脸展现招牌尬笑", "高市早苗G20狂找存在感", "东京车辆冲撞行人致11人死伤", "中方：当前不具备举行中日韩会议条件", "荒野求生“老中医”曝林北偷猕猴桃", "海外留学10年男子回国当搬家工", "距台湾110公里 日防相督阵部署导弹", "莫言否认偷瓜梗后余华承认了", "中国军号再发日语海报警告日方", "荒野求生决赛选手每隔10天可选去留", "北京下雪了", "英国前首相卡梅伦患前列腺癌", "女子称帮小11岁二婚丈夫还几十万赌债", "韩国总统李在明：希望早日访华", "被困高铁厕所乘客身体无碍", "全国流感活动进入上升期", "屈臣氏CEO在香港救起坠海女子", "驻韩美军一架“死神”无人机坠毁", "执政一个月 高市早苗惹恼周边五国", "流感病毒“进化”了吗 专家回应", "官方通报“彝族老人被围堵拍摄”", "两幅金代佛画真迹现身拍卖场", "三大指数小幅上涨 军工板块掀涨停潮", "深江铁路13死坍塌事故调查报告公布", "今晚下调油价 加满一箱少花2.5元", "科研人员揭开嫦娥六号月壤黏性之谜", "默茨：美国缺席了正形成的世界新秩序", "李在明夫人被南非欢迎仪式吓到", "邮轮鼓浪屿号取消明年1月前日本航线"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
