// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.186
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
var default_search_words = ["“把造福人民作为根本价值取向”", "事关2亿多人！重磅条例来了", "两高中生骑电动车撞墙身亡 家属发声", "三预警齐发 这些地区出行需注意", "特朗普评审少女模特旧视频疯传", "山姆从“闭眼买”变“不敢信”", "特朗普发声后 可口可乐官宣了", "警方通报多名乘客在飞机上打架", "专家：中日关系或面临波动", "价值数百万美元的天价香蕉又被吃了", "19岁男生刚上大一就拿到国企offer", "“燃油宝”能让1箱油顶1箱半？假", "女子打工被骗逃回家后发现儿子丢了", "特朗普：期待在不久的将来访问中国", "男子回家发现妻子被绑床上 案情离谱", "特朗普：奥巴马犯叛国罪", "杭州地铁里的傲娇警犬火出圈", "A股重磅！“国家队”再度出手", "4岁男童全麻拔乳牙身亡 医院回应", "无人机被土拨鼠叼进洞 游客求助客服", "张予曦毕雯珺为剧宣接吻被批尺度大", "浙大95后博导白天搞科研晚上打浙BA", "美财长：中美第三轮磋商下周举行", "中纪委再次点名医药腐败", "满载铜矿的船朝着美国港口狂飙", "电车停在家中起火 户主：半个月没开", "坠楼生还男童父亲给救命树系大红花", "特朗普称美日达成协议：15%关税", "一批新大学分数线超985高校", "格鲁吉亚女子突然发狂咬住护士颈部", "24小时不间断交易 股市大动作来了吗", "中国激光反无系统打靶画面正式公开", "小伙开百万豪车送外卖 本人发声", "大爷大娘排队贴摘豆角甲片", "“蝉尿”攻击对人体有害吗", "男子为坐牢报假警称自己杀了人", "特斯拉餐厅6小时狂赚4.7万美元", "浙江人均可支配收入居全国各省区第1", "白宫：以空袭叙利亚让特朗普措手不及", "玩真人CS坠亡男孩母亲发声", "热门中概股普涨 蔚来涨超10%", "佛山四区基孔肯雅热升至2658例", "故宫致歉：异常购票观众可免费参观", "美国第三次“退群” 古特雷斯发声", "特朗普：将对菲律宾征收19%关税", "美国将核武器重新部署到英空军基地", "夏天树下淋的雨可能是“蝉尿”", "广东基孔肯雅热确诊已超2000例", "中国平均每人每年吃近100斤西瓜", "人工增雨 河南5地发布公告", "稳定币拯救“烂生意”"]

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
