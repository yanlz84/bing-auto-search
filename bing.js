// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.429
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
var default_search_words = ["习近平总书记关切事", "全运会闭幕式", "中国驻日使馆重申敌国条款", "这是十五运会老将的最后一舞", "中美合拍《我的哪吒与变形金刚》定档", "印度国产光辉战机在迪拜航展坠毁", "俄发布日本1945年投降画面警告日本", "仰望U9X刷新全国赛道纪录", "亲女儿回应老人全网求认干女儿", "外交部回应高市早苗最新涉华言论", "或永久限制登录！微信发布公告", "地球将进入小冰河期系误区", "一身赘肉成选美冠军只是乌龙吗", "葫芦岛有多人往海里“放生”大米", "解放军报警告：高市要日本万劫不复吗", "印度坠毁光辉战机飞行员已死亡", "39人粤语合唱团竟只有1人会粤语", "日本演员古川雄辉发文致歉", "美海军开始打捞南海坠毁的军机", "外交部回应日本出口杀伤性武器", "少子化7年后将波及大学生源", "女孩被母亲男友多次强奸 男子获刑", "画家在树洞作画后被城管责令涂掉", "男装店把吊牌做成超大鼠标垫", "中方回应乌称摧毁中国制造火箭炮", "男子22元买羽绒服遭拒发货", "全运会落幕最大赢家竟是一只“鸡”？", "民警卧底传销组织 疯狂洗脑场面曝光", "“最美”女大校当选院士", "高市早苗惹恼马来西亚民众", "学院更名为星际航行学院？国科大回应", "沪指跌2.45%失守3900点", "山西发现一座距今4300年“宫城”", "中国军号海外发布高燃视频：一切就绪", "高校师生下湖捞鱼 直播间超10万人", "中国军号连续5天在海外发视频", "香港一电视台已停播日本动画", "大爷拿文玩核桃逗松鼠被叼走", "“南郭先生”为何会成为首席科学家", "信用卡3年减少9000多万张 你还用吗", "江科大郭某团队博士：他从未上过课", "足浴店辟谣招到首个211本科女生", "台退役少校：台湾的事关日本什么事", "佛山秋假“鱼档少年”刮鱼鳞走红", "12306回应高铁不卖卫生巾", "美称不确定南海坠毁军机能否捞出", "白宫回应特朗普称女记者为“小猪”", "十五运会最后一金“花落”上海", "#小雪腌菜藏住一冬的鲜香#", "广西女子被传在柬埔寨劫囚 当地回应", "熊猫“奶爸奶妈”有专属职称了"]

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
