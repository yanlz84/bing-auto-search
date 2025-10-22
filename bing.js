// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.368
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
var default_search_words = ["奋斗 为了人民的向往", "微信三大更新放出", "教授每年强制自己定投100克黄金", "国产医疗装备“利器”层出", "朱枫上海地下工作身份证首次亮相", "全国最忙高铁站上演名场面", "红霉素软膏千万不能随便用", "不用中考 十二年贯通式学校来了", "男友去世女子生下遗腹子想要赔偿款", "你的幸福拼图是哪一块", "烤肉店用玉米粒当燃料 玉米专家发声", "“趵突泉靠水泵才能喷涌”系谣言", "00后女生拍摄75岁老会计同事走红", "南极旅游价格被打下来了", "海景房把清晰看军港当卖点泄密", "云南：公务出行不得租用奔驰宝马奥迪", "国防部回应澳军机侵闯西沙领空", "泽连斯基：已准备好结束俄乌冲突", "张伯礼院士严正声明", "酒席为小朋友准备两桌肯德基", "女装店主不建议买300元以下羽绒服", "现货黄金创4年来最大跌幅", "“下地干活式旅游”火了", "王楚钦孙颖莎等国乒五大主力退赛", "上海出租上新车型 可放6件大行李箱", "作家匪我思存受聘武汉大学文学院", "日本警方从女子内衣中搜出黄金8公斤", "官方回应公厕被改成现磨咖啡店", "河南一老板挣100万分给员工85万", "阿迪达斯羽绒服竟是雪中飞代工的", "于东来“个人分享交流”收费50万元", "特朗普对俄乌和谈态度再变", "仰望U9X刷新纽北量产电车圈速纪录", "李在明贴身保镖火了", "两个法国人裸辞后徒步一年到新疆", "中国找矿有新发现！大型锶矿床+1", "国民党回应民进党：您哪位", "故宫守护者用熨斗烫出一座乾隆花园", "特朗普又改口：我从未说过乌克兰会赢", "现货黄金向下跌破4200美元", "31省份最低工资一览表", "BOSS直聘回应“前台”被列竞招职位", "日本流感疫情持续扩散", "欧洲多国领导人发表联合声明", "高市早苗举行就任后首次记者会", "韩称朝鲜向半岛东部海域发射导弹", "俄外长：立即停火方案违背俄美的共识", "泽连斯基：不接受俄要求的停战条件", "匈牙利延长国家紧急状态180天", "“用AI流浪汉骗家人”走红 民警提醒", "前象棋第一人王天一就买卖棋道歉"]

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
