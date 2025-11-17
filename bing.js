// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.421
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
var default_search_words = ["在法治轨道上推进中国式现代化", "中部空军发布：枪已上膛 剑已出鞘", "“堤丰”撤离日本", "“中国屏”靠什么逆袭", "中国强烈回应震动日本", "湖南一婴儿刚出生就“15岁”", "净网：任性宣泄不可取 两人被行拘", "日媒叫嚣击沉福建舰？“没这个能力”", "台湾34个团体联合发表抗议声明", "李强总理没有会见日方领导人的安排", "部分日本电影宣布暂缓上映", "警惕送上门的免费试吃卡诈骗", "霍启仁在玉龙雪山举办婚礼", "中方回应韩国对日本表示强烈抗议", "外交部回应日本外务省高官访华", "日本高官抵京 面对记者提问一言不发", "张展硕男子1500米自由泳夺冠", "河南下大雪", "日本极右翼也怕了：这点国力何必惹事", "特斯拉“去中国化”的背后隐藏什么", "韩方叫停韩日联合演习", "为啥日本着急派高官来华解释", "东部战区发布重磅MV《若一去不回》", "外交部驳斥日本政客称中方反应过度", "高市“玩火” 日本“炸锅”", "重庆一野猪在桥上突然跳桥死亡", "外交部再发声：敦促日方停止越线玩火", "日本有重蹈军国主义覆辙的危险", "“老虎”不发威 你当我是“病猫”", "“都说了北京有海吧”", "外交部：感谢韩方协助救援中国渔船", "“日本有事”就是“美国有事”？", "朝鲜批日本暴露战争国家丑恶嘴脸", "曝iPhone17 Pro Max被湿巾擦掉色", "影院回应日本电影撤档", "酒后骑车违法吗？一瓶啤酒也算酒驾", "甘肃现七彩祥云 或与导弹发射有关", "日媒：中国的反应“超出预期”", "世界冠军扎堆了 我该支持谁", "外交部就核潜艇一事喊话美韩", "受贿1.17亿余元 李显刚一审被判无期", "高市早苗正在反省其涉台言论", "武汉今年初雪比去年提前了23天", "许绍雄追悼会举行 成龙古天乐送花圈", "孚日股份澄清涨停原因：与谐音无关", "董璇解释张维伊叫小酒窝窝子的原因", "寒潮“拍了拍”南方", "航司回应取消赴日航班：公共安全原因", "本轮寒潮大风降温何时结束", "新人在婚礼上为已故爷爷留专属座位", "北大口腔回应“博士后”被写成学历"]

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
