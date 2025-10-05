// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.335
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
var default_search_words = ["中华民族的文化根脉", "到了冰岛以为没出国 身边全是中国话", "用微信收付款这个功能一定要开启", "中秋“硬核”赏月指南来了", "游客偶遇大熊猫过河 景区：纯野生", "年轻人开始追求“情绪旅游”", "王曼昱4比2战胜孙颖莎 夺女单冠军", "王楚钦横扫小勒布伦 加冕三冠王", "越来越多人爱上了“窝囊游”", "朝鲜武器展震撼登场", "河南卫视中秋晚会", "“台风把鲸鱼吹上岸”系谣言", "“环保少女”被曝在狱中遭以军虐待", "广东省委书记：迅速进入战时状态", "鹦鹉把家里的事全抖出来了", "安徽卫视中秋晚会", "四川考古新发现：明代石刻写禁止早婚", "列车上铺男子跌落砸断10岁女孩腿骨", "60岁老人离退休仅23天跳水救人溺亡", "马来西亚游客感叹中国人好幸福", "5两的大闸蟹捆了1两的绳子", "被高喊退票 景区让游客去别处玩", "女子滑落悬崖 抓树枝悬空半小时获救", "王曼昱回应4比2孙颖莎", "第一批去俄罗斯旅游的人体验如何", "东南卫视中秋晚会", "“全网最爱发钱老板”回应作秀质疑", "苏超淘汰赛：徐州vs泰州", "台风麦德姆登陆广东 最大风力14级", "长沙街头交警硬核管理外国人", "美战争部长带3068人做俯卧撑创纪录", "“鸡排哥”称国庆只用了60%功力", "吴克群方回应现身素人婚礼现场", "王楚钦夺冠后对自己说“你挺棒的”", "#直击台风麦德姆登陆#", "“您养我长大 我背您看世界”", "“水下嫦娥和吴刚”惊现武汉", "广东多地现海水倒灌", "男子体内抽出牛奶血 这样吃饭危害大", "麦德姆登陆 狂风暴雨中树木猛摇", "乌称遭俄50枚导弹500架无人机袭击", "国乒再度包揽中国大满贯五冠", "胡塞高超音速导弹袭击耶路撒冷", "#国庆假期我在景区被人人人包围了#", "男子查出肾结石未重视拖成大麻烦", "波兰凌晨紧急出动战机：最高戒备", "《黑神话：钟馗》获金摇杆提名", "国庆多地开启“花式宠客”模式", "伊朗称开罗协议“不再适用”", "林诗栋不敌小勒布伦 无缘男单决赛", "“老顽童爷爷”赵克明因病去世"]

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
