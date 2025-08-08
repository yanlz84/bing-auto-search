// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.218
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
var default_search_words = ["把党的自我革命这根弦绷得更紧", "凌晨家长不在家孩子被抽血 湛江回应", "马库斯看《南京照相馆》一度离场呕吐", "京津冀等9省区市部分地区将迎暴雨", "人均2000元合租拿下深圳独栋别墅", "中国海大海水吊坠被标价5000元出售", "GPT-5写作像诗人", "五台山徒步人员伤亡？网民造谣被拘", "男子因12字评论被行拘5天 2年后翻案", "日本人口即将跌破1.2亿", "迪丽热巴《利剑玫瑰》热播登7月沸点榜", "少林寺回应拒绝游客入内避雨", "郑州暴雨一商场员工筑起人墙挡雨", "赵露思“掀桌”后需要付出什么代价", "村民路边偶遇东北虎脑袋如脸盆大", "女子点100份三文鱼吃了吐吐了吃", "1997年掉入冰川 失踪男子尸体被发现", "赵露思直播带火葛根茶 负责人发声", "跳水女皇高敏谈全红婵体重变化", "宁波一市民家中养画眉鸟被立案调查", "郑州司机：被堵隧道10分钟水淹到车窗", "中原粮仓太难了", "陈思诚卡点晒照为佟丽娅庆生", "民办本科有的反超985有的生源招不满", "父亲离婚私自卖女儿房子 判赔1160万", "女子因猫与男友争吵后被害", "曾自曝1天带货2.3亿的网红患焦虑症", "世运会中国运动员跳着舞入场", "带娃买火车票被分隔 12306：不能选座", "秘鲁女子吵架冲向男友力道过大坠亡", "首个渐冻症精准治疗药物在武汉注射", "特朗普：莫斯科谈判取得了重大进展", "男子用巴黎烈士墓长明火点烟被捕", "中国移动上半年日赚4.6亿元", "马库斯：要努力像中国人民一样勇敢", "成都世运会开幕 肖国栋称太震撼", "新华网评：认证靠“3C贴纸”在糊弄谁", "年轻人流行骑自行车送外卖 带薪减肥", "广东一地错发30万补贴公告追回", "国产遮阳帽为何能在海外平台卖爆", "蔡正元：台当局要承认台湾是中国领土", "郑州京广路隧道被淹有人爬梯子脱困", "OpenAI：GPT-5将免费提供给用户", "石破茂：强烈要求美方立即修改行政令", "中国坚决反对大规模杀伤性武器扩散", "东莞内涝 两辆未上牌小米SU7被淹", "1750瓶茅台将被司法拍卖", "特朗普就美俄元首会晤表态", "美国少年玩枪子弹射穿楼板打死表妹", "美国富翁在南非狩猎时被水牛顶死", "奶茶爆单 有人上午点下午还没喝到"]

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
