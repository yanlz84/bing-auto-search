// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.261
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
var default_search_words = ["这一精神何以成为上合“发展密码”", "中方回应俄罗斯袭击乌克兰首都", "泰国女总理佩通坦遭解职", "最大规模军乐团 即将亮相九三阅兵", "央视七夕晚会", "原房主跳楼身亡 房子1457000元拍出", "网警提醒：七夕浪漫需警惕", "泰国被解职总理佩通坦称认可判决", "华晨宇七夕准备了8万朵玫瑰花", "中方：某常任理事国一意孤行令人失望", "胖东来免费筷子无标签被顾客起诉", "“鸡蛋储存前要清洗”系误读", "具俊晔七夕看望大S 墓地摆满合照", "LV龙虾造型手袋售价55500元", "动物园山魈突然转身扔石头砸碎玻璃", "住户因马桶冲水声太响被邻居起诉", "辛巴宣布退网后三次连麦直播带货", "1岁女宝因前额秃被调侃像老干部", "佩通坦被解除泰总理职务后微笑露面", "苏有朋因“卖艺不卖身”言论道歉", "中方回应美计划在日本部署中程导弹", "身患绝症老人多次猥亵女性未被处理", "73岁唐国强一下车就对粉丝敬礼", "两女子花3万请24位陪爬登顶泰山", "一顿宵夜后29岁男子血液变“牛奶”", "网红Coser“若童”因肠癌去世", "医生：HPV是夫妻病", "专家谈深圳退休夫妇欠债1.2亿元", "万斯称若特朗普遇不测已准备好接班", "年轻人胃癌发病率30年翻一倍", "姐姐七夕领证 弟弟凌晨5点帮排队", "外交部回应撤侨", "日本火山喷发 烟尘最高达5500米", "新人在赛里木湖搭帐篷通宵排队领证", "男子吃隔夜牛蛙引发脓毒血症", "20台空调外机装车库 业主喊热", "高校开学把人形机器人志愿者忙坏了", "微信再开放520大额红包 律师提醒", "刘强东七夕现身宿迁", "女子连续熬夜刷短剧视力骤降至0.04", "中国必将统一的大势不可阻挡", "九三阅兵临近日本为何急了", "30名“优质相亲女”落网", "爱的模样在此刻具象化了", "开学“突击补作业”代表队已就位", "肯尼亚一网红大象被游客灌啤酒", "吴彦祖夫妇抽象过七夕 跳舞秀恩爱", "8名中国游客在瑞典采食蘑菇中毒", "豪车停路边5年 车主欠千元停车费", "长沙地铁集体婚礼", "战略兵种方队将擎崭新军旗亮相阅兵"]

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
